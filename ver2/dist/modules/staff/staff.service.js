"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAccounts = listAccounts;
exports.setAccountActive = setAccountActive;
exports.resetStaffPassword = resetStaffPassword;
exports.createDoctor = createDoctor;
exports.listDoctors = listDoctors;
exports.getDoctor = getDoctor;
exports.updateDoctor = updateDoctor;
exports.createTechnician = createTechnician;
exports.listTechnicians = listTechnicians;
exports.getTechnician = getTechnician;
exports.updateTechnician = updateTechnician;
exports.createCashier = createCashier;
exports.createReceptionist = createReceptionist;
const query_1 = require("../../db/query");
const error_1 = require("../../middleware/error");
const password_1 = require("../../utils/password");
const date_1 = require("../../utils/date");
function toPublicUser(u) {
    return {
        id: u.id,
        username: u.username,
        role: u.role,
        is_active: u.is_active,
    };
}
async function ensureUsernameFree(username) {
    const dup = await (0, query_1.queryOne)('SELECT id FROM users WHERE username = $1', [
        username,
    ]);
    if (dup)
        throw new error_1.AppError(409, 'Username đã tồn tại');
}
async function listAccounts(q) {
    const rows = await (0, query_1.query)(`SELECT u.id, u.username, u.role, u.is_active, u.auto_schedule_paused,
            COALESCE(d.full_name, t.full_name, p.full_name) AS full_name,
            p.date_of_birth
       FROM users u
       LEFT JOIN doctors d     ON d.user_id = u.id
       LEFT JOIN technicians t ON t.user_id = u.id
       LEFT JOIN patients p    ON p.user_id = u.id
      WHERE ($1::user_role IS NULL OR u.role = $1::user_role)
        AND ($2::boolean   IS NULL OR u.is_active = $2::boolean)
      ORDER BY u.role, u.username`, [
        q.role ?? null,
        q.is_active === undefined ? null : q.is_active === 'true',
    ]);
    return rows.map((r) => ({
        id: r.id,
        username: r.username,
        role: r.role,
        is_active: r.is_active,
        auto_schedule_paused: r.auto_schedule_paused,
        full_name: r.full_name,
        age: r.date_of_birth ? (0, date_1.calcAge)(r.date_of_birth) : null,
    }));
}
async function setAccountActive(targetUserId, requesterUserId, isActive) {
    if (targetUserId === requesterUserId) {
        throw new error_1.AppError(400, 'Không thể tự khóa/mở khóa tài khoản của chính mình');
    }
    const user = await (0, query_1.queryOne)('SELECT * FROM users WHERE id = $1', [
        targetUserId,
    ]);
    if (!user)
        throw new error_1.AppError(404, 'Tài khoản không tồn tại');
    // Bảo vệ: không cho phép khóa manager cuối cùng đang active — sẽ không còn ai
    // có quyền mở khóa lại, hệ thống lock chính nó.
    if (!isActive && user.role === 'manager' && user.is_active) {
        const others = await (0, query_1.queryOne)(`SELECT COUNT(*) AS n FROM users
        WHERE role = 'manager' AND is_active = TRUE AND id <> $1`, [targetUserId]);
        if (others && Number(others.n) === 0) {
            throw new error_1.AppError(409, 'Không thể khóa manager cuối cùng — hệ thống cần ít nhất 1 manager active');
        }
    }
    const updated = await (0, query_1.queryOne)('UPDATE users SET is_active = $1 WHERE id = $2 RETURNING *', [isActive, targetUserId]);
    return toPublicUser(updated);
}
// Manager reset mật khẩu cho staff (doctor/technician/cashier/receptionist).
// Sinh mật khẩu mới, trả về cho manager đọc và đưa tận tay staff
// (không gửi SMS vì staff không lưu SĐT trong bảng users).
async function resetStaffPassword(targetUserId, requesterUserId) {
    if (targetUserId === requesterUserId)
        throw new error_1.AppError(400, 'Không thể reset mật khẩu của chính mình — dùng change-password');
    const user = await (0, query_1.queryOne)('SELECT * FROM users WHERE id = $1', [
        targetUserId,
    ]);
    if (!user)
        throw new error_1.AppError(404, 'Tài khoản không tồn tại');
    if (user.role === 'patient')
        throw new error_1.AppError(400, 'Reset mật khẩu bệnh nhân qua /patients/:id/reset-password');
    const newPassword = (0, password_1.generatePassword)();
    const newHash = await (0, password_1.hashPassword)(newPassword);
    await (0, query_1.queryOne)(`UPDATE users
        SET password_hash = $1,
            failed_login_count = 0,
            locked_until = NULL
      WHERE id = $2 RETURNING id`, [newHash, targetUserId]);
    return { username: user.username, new_password: newPassword };
}
// ═══════════════════════════════════════════════════════════════════════════
// DOCTOR
// ═══════════════════════════════════════════════════════════════════════════
async function createDoctor(input) {
    await ensureUsernameFree(input.username);
    const dept = await (0, query_1.queryOne)('SELECT id FROM departments WHERE id = $1', [
        input.department_id,
    ]);
    if (!dept)
        throw new error_1.AppError(404, 'Khoa không tồn tại');
    const hash = await (0, password_1.hashPassword)(input.password);
    return (0, query_1.withTransaction)(async (client) => {
        const u = await client.query(`INSERT INTO users (username, password_hash, role)
       VALUES ($1, $2, 'doctor') RETURNING *`, [input.username, hash]);
        const user = u.rows[0];
        const d = await client.query(`INSERT INTO doctors (user_id, full_name, department_id)
       VALUES ($1, $2, $3) RETURNING *`, [user.id, input.full_name, input.department_id]);
        return { user: toPublicUser(user), doctor: d.rows[0] };
    });
}
async function listDoctors() {
    return (0, query_1.query)(`SELECT dr.*, u.username, u.is_active, dep.name AS department_name
       FROM doctors dr
       JOIN users u        ON u.id = dr.user_id
       JOIN departments dep ON dep.id = dr.department_id
      ORDER BY dr.full_name ASC`);
}
async function getDoctor(id) {
    const row = await (0, query_1.queryOne)('SELECT * FROM doctors WHERE id = $1', [id]);
    if (!row)
        throw new error_1.AppError(404, 'Bác sĩ không tồn tại');
    return row;
}
async function updateDoctor(id, input) {
    const doctor = await getDoctor(id);
    if (input.department_id !== undefined) {
        const dept = await (0, query_1.queryOne)('SELECT id FROM departments WHERE id = $1', [
            input.department_id,
        ]);
        if (!dept)
            throw new error_1.AppError(404, 'Khoa không tồn tại');
    }
    return (0, query_1.withTransaction)(async (client) => {
        const sets = [];
        const params = [];
        let i = 1;
        if (input.full_name !== undefined) {
            sets.push(`full_name = $${i++}`);
            params.push(input.full_name);
        }
        if (input.department_id !== undefined) {
            sets.push(`department_id = $${i++}`);
            params.push(input.department_id);
        }
        let updatedDoctor = doctor;
        if (sets.length > 0) {
            params.push(id);
            const r = await client.query(`UPDATE doctors SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, params);
            updatedDoctor = r.rows[0];
        }
        let autoPaused;
        if (input.auto_schedule_paused !== undefined) {
            const u = await client.query('UPDATE users SET auto_schedule_paused = $1 WHERE id = $2 RETURNING *', [input.auto_schedule_paused, doctor.user_id]);
            autoPaused = u.rows[0].auto_schedule_paused;
        }
        else {
            const u = await client.query('SELECT auto_schedule_paused FROM users WHERE id = $1', [doctor.user_id]);
            autoPaused = u.rows[0].auto_schedule_paused;
        }
        return { ...updatedDoctor, auto_schedule_paused: autoPaused };
    });
}
// ═══════════════════════════════════════════════════════════════════════════
// TECHNICIAN
// ═══════════════════════════════════════════════════════════════════════════
async function createTechnician(input) {
    await ensureUsernameFree(input.username);
    const room = await (0, query_1.queryOne)('SELECT id FROM lab_rooms WHERE id = $1', [input.lab_room_id]);
    if (!room)
        throw new error_1.AppError(404, 'Phòng xét nghiệm không tồn tại');
    const taken = await (0, query_1.queryOne)('SELECT id FROM technicians WHERE lab_room_id = $1', [input.lab_room_id]);
    if (taken)
        throw new error_1.AppError(409, 'Phòng xét nghiệm đã có kỹ thuật viên phụ trách');
    const hash = await (0, password_1.hashPassword)(input.password);
    return (0, query_1.withTransaction)(async (client) => {
        const u = await client.query(`INSERT INTO users (username, password_hash, role)
       VALUES ($1, $2, 'technician') RETURNING *`, [input.username, hash]);
        const user = u.rows[0];
        const t = await client.query(`INSERT INTO technicians (user_id, full_name, lab_room_id)
       VALUES ($1, $2, $3) RETURNING *`, [user.id, input.full_name, input.lab_room_id]);
        return { user: toPublicUser(user), technician: t.rows[0] };
    });
}
async function listTechnicians() {
    return (0, query_1.query)(`SELECT te.*, u.username, u.is_active, lr.name AS lab_room_name
       FROM technicians te
       JOIN users u     ON u.id = te.user_id
       JOIN lab_rooms lr ON lr.id = te.lab_room_id
      ORDER BY te.full_name ASC`);
}
async function getTechnician(id) {
    const row = await (0, query_1.queryOne)('SELECT * FROM technicians WHERE id = $1', [id]);
    if (!row)
        throw new error_1.AppError(404, 'Kỹ thuật viên không tồn tại');
    return row;
}
async function updateTechnician(id, input) {
    await getTechnician(id);
    const sets = [];
    const params = [];
    let i = 1;
    if (input.full_name !== undefined) {
        sets.push(`full_name = $${i++}`);
        params.push(input.full_name);
    }
    if (input.lab_room_id !== undefined) {
        const room = await (0, query_1.queryOne)('SELECT id FROM lab_rooms WHERE id = $1', [
            input.lab_room_id,
        ]);
        if (!room)
            throw new error_1.AppError(404, 'Phòng xét nghiệm không tồn tại');
        const taken = await (0, query_1.queryOne)('SELECT id FROM technicians WHERE lab_room_id = $1 AND id <> $2', [input.lab_room_id, id]);
        if (taken)
            throw new error_1.AppError(409, 'Phòng xét nghiệm đã có kỹ thuật viên phụ trách');
        sets.push(`lab_room_id = $${i++}`);
        params.push(input.lab_room_id);
    }
    if (sets.length === 0)
        throw new error_1.AppError(400, 'Không có thông tin cần cập nhật');
    params.push(id);
    const row = await (0, query_1.queryOne)(`UPDATE technicians SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, params);
    return row;
}
// ═══════════════════════════════════════════════════════════════════════════
// CASHIER / RECEPTIONIST — không có bảng profile, thông tin đủ trong users
// ═══════════════════════════════════════════════════════════════════════════
async function createBasicStaff(input, role) {
    await ensureUsernameFree(input.username);
    const hash = await (0, password_1.hashPassword)(input.password);
    const user = await (0, query_1.queryOne)(`INSERT INTO users (username, password_hash, role)
     VALUES ($1, $2, $3) RETURNING *`, [input.username, hash, role]);
    return toPublicUser(user);
}
function createCashier(input) {
    return createBasicStaff(input, 'cashier');
}
function createReceptionist(input) {
    return createBasicStaff(input, 'receptionist');
}
//# sourceMappingURL=staff.service.js.map