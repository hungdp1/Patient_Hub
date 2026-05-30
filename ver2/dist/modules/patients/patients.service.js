"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPatient = createPatient;
exports.listPatients = listPatients;
exports.getPatientById = getPatientById;
exports.getPatientByUserId = getPatientByUserId;
exports.updatePatient = updatePatient;
exports.resetPassword = resetPassword;
const query_1 = require("../../db/query");
const error_1 = require("../../middleware/error");
const password_1 = require("../../utils/password");
const crypto_1 = require("../../utils/crypto");
const sms_1 = require("../../utils/sms");
const date_1 = require("../../utils/date");
function toDTO(row) {
    return {
        id: row.id,
        user_id: row.user_id,
        full_name: row.full_name,
        date_of_birth: row.date_of_birth,
        age: (0, date_1.calcAge)(row.date_of_birth),
        gender: row.gender,
        blood_type: row.blood_type,
        address: row.address,
        phone: (0, crypto_1.decrypt)(row.phone_encrypted),
        insurance_number: row.insurance_number_encrypted
            ? (0, crypto_1.decrypt)(row.insurance_number_encrypted)
            : null,
        insurance_expiry: row.insurance_expiry,
        priority_type: row.priority_type,
        created_at: row.created_at,
        updated_at: row.updated_at,
    };
}
// Tiếp tân tạo tài khoản — username = SĐT, mật khẩu sinh tự động gửi qua SMS.
async function createPatient(input) {
    const dup = await (0, query_1.queryOne)('SELECT id FROM users WHERE username = $1', [
        input.phone,
    ]);
    if (dup)
        throw new error_1.AppError(409, 'Số điện thoại đã được dùng cho một tài khoản khác');
    const password = (0, password_1.generatePassword)();
    const hash = await (0, password_1.hashPassword)(password);
    const created = await (0, query_1.withTransaction)(async (client) => {
        const u = await client.query(`INSERT INTO users (username, password_hash, role)
       VALUES ($1, $2, 'patient') RETURNING *`, [input.phone, hash]);
        const user = u.rows[0];
        const p = await client.query(`INSERT INTO patients
         (user_id, full_name, date_of_birth, gender, blood_type, address,
          phone_encrypted, insurance_number_encrypted, insurance_expiry, priority_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`, [
            user.id,
            input.full_name,
            input.date_of_birth,
            input.gender,
            input.blood_type ?? null,
            input.address ?? null,
            (0, crypto_1.encrypt)(input.phone),
            input.insurance_number ? (0, crypto_1.encrypt)(input.insurance_number) : null,
            input.insurance_expiry ?? null,
            input.priority_type ?? null,
        ]);
        return p.rows[0];
    });
    (0, sms_1.sendSms)(input.phone, `Tài khoản bệnh viện đã được tạo. Tên đăng nhập: ${input.phone}. Mật khẩu: ${password}`);
    return toDTO(created);
}
async function listPatients(name) {
    const rows = name
        ? await (0, query_1.query)('SELECT * FROM patients WHERE full_name ILIKE $1 ORDER BY full_name ASC', [`%${name}%`])
        : await (0, query_1.query)('SELECT * FROM patients ORDER BY full_name ASC');
    return rows.map(toDTO);
}
async function getPatientById(id) {
    const row = await (0, query_1.queryOne)('SELECT * FROM patients WHERE id = $1', [id]);
    if (!row)
        throw new error_1.AppError(404, 'Bệnh nhân không tồn tại');
    return toDTO(row);
}
async function getPatientByUserId(userId) {
    const row = await (0, query_1.queryOne)('SELECT * FROM patients WHERE user_id = $1', [userId]);
    if (!row)
        throw new error_1.AppError(404, 'Không tìm thấy hồ sơ bệnh nhân');
    return toDTO(row);
}
// Tiếp tân sửa thông tin: cần mật khẩu hiện tại, sau khi sửa sinh mật khẩu mới
// và gửi về SĐT (đã cập nhật nếu có đổi).
async function updatePatient(id, input) {
    const patient = await (0, query_1.queryOne)('SELECT * FROM patients WHERE id = $1', [id]);
    if (!patient)
        throw new error_1.AppError(404, 'Bệnh nhân không tồn tại');
    const user = await (0, query_1.queryOne)('SELECT * FROM users WHERE id = $1', [
        patient.user_id,
    ]);
    if (!user)
        throw new error_1.AppError(404, 'Tài khoản bệnh nhân không tồn tại');
    const ok = await (0, password_1.verifyPassword)(input.currentPassword, user.password_hash);
    if (!ok)
        throw new error_1.AppError(400, 'Mật khẩu hiện tại của bệnh nhân không đúng');
    if (input.phone !== undefined && input.phone !== user.username) {
        const dup = await (0, query_1.queryOne)('SELECT id FROM users WHERE username = $1 AND id <> $2', [input.phone, user.id]);
        if (dup)
            throw new error_1.AppError(409, 'Số điện thoại đã được dùng cho một tài khoản khác');
    }
    const sets = [];
    const params = [];
    let i = 1;
    const push = (col, val) => {
        sets.push(`${col} = $${i++}`);
        params.push(val);
    };
    if (input.full_name !== undefined)
        push('full_name', input.full_name);
    if (input.date_of_birth !== undefined)
        push('date_of_birth', input.date_of_birth);
    if (input.gender !== undefined)
        push('gender', input.gender);
    if (input.blood_type !== undefined)
        push('blood_type', input.blood_type);
    if (input.address !== undefined)
        push('address', input.address);
    if (input.phone !== undefined)
        push('phone_encrypted', (0, crypto_1.encrypt)(input.phone));
    if (input.insurance_number !== undefined)
        push('insurance_number_encrypted', input.insurance_number ? (0, crypto_1.encrypt)(input.insurance_number) : null);
    if (input.insurance_expiry !== undefined)
        push('insurance_expiry', input.insurance_expiry);
    if (input.priority_type !== undefined)
        push('priority_type', input.priority_type);
    if (sets.length === 0)
        throw new error_1.AppError(400, 'Không có thông tin cần cập nhật');
    // CHỈ reset mật khẩu nếu SĐT (username) thay đổi — không spam SMS mỗi lần
    // sửa địa chỉ. Khi đổi SĐT thì bắt buộc reset vì username = SĐT cần khớp.
    const phoneChanged = input.phone !== undefined && input.phone !== user.username;
    const finalPhone = phoneChanged ? input.phone : user.username;
    const newPassword = phoneChanged ? (0, password_1.generatePassword)() : null;
    const newHash = newPassword ? await (0, password_1.hashPassword)(newPassword) : null;
    const updated = await (0, query_1.withTransaction)(async (client) => {
        params.push(id);
        const r = await client.query(`UPDATE patients SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, params);
        if (phoneChanged) {
            await client.query('UPDATE users SET username = $1, password_hash = $2 WHERE id = $3', [finalPhone, newHash, user.id]);
        }
        return r.rows[0];
    });
    if (phoneChanged && newPassword) {
        (0, sms_1.sendSms)(finalPhone, `Số điện thoại tài khoản đã được cập nhật. Tên đăng nhập: ${finalPhone}. Mật khẩu mới: ${newPassword}`);
    }
    return toDTO(updated);
}
// Quên mật khẩu — sinh mật khẩu mới gửi về SĐT bệnh nhân.
// Đồng thời clear lock counter (consistent với auth.forgotPassword).
async function resetPassword(id) {
    const patient = await (0, query_1.queryOne)('SELECT * FROM patients WHERE id = $1', [id]);
    if (!patient)
        throw new error_1.AppError(404, 'Bệnh nhân không tồn tại');
    const newPassword = (0, password_1.generatePassword)();
    const newHash = await (0, password_1.hashPassword)(newPassword);
    await (0, query_1.queryOne)(`UPDATE users
        SET password_hash = $1,
            failed_login_count = 0,
            locked_until = NULL
      WHERE id = $2 RETURNING id`, [newHash, patient.user_id]);
    const phone = (0, crypto_1.decrypt)(patient.phone_encrypted);
    (0, sms_1.sendSms)(phone, `Mật khẩu mới của bạn: ${newPassword}`);
}
//# sourceMappingURL=patients.service.js.map