"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPrescription = createPrescription;
exports.getPrescription = getPrescription;
exports.listBySession = listBySession;
exports.updatePrescription = updatePrescription;
const query_1 = require("../../db/query");
const error_1 = require("../../middleware/error");
async function doctorIdOfUser(userId) {
    const row = await (0, query_1.queryOne)('SELECT id FROM doctors WHERE user_id = $1', [userId]);
    if (!row)
        throw new error_1.AppError(404, 'Không tìm thấy hồ sơ bác sĩ');
    return row.id;
}
async function patientIdOfUser(userId) {
    const row = await (0, query_1.queryOne)('SELECT id FROM patients WHERE user_id = $1', [userId]);
    if (!row)
        throw new error_1.AppError(404, 'Không tìm thấy hồ sơ bệnh nhân');
    return row.id;
}
async function loadOwnedSession(sessionId, actor) {
    const session = await (0, query_1.queryOne)('SELECT * FROM examination_sessions WHERE id = $1', [sessionId]);
    if (!session)
        throw new error_1.AppError(404, 'Đợt khám không tồn tại');
    const did = await doctorIdOfUser(actor.sub);
    if (session.doctor_id !== did)
        throw new error_1.AppError(403, 'Đây không phải đợt khám của bạn');
    if (session.is_finalized)
        throw new error_1.AppError(409, 'Đợt khám đã chốt, không thể thay đổi đơn thuốc');
    return session;
}
// Điều kiện cấp đơn: không còn xét nghiệm dở dang và mọi kết quả đã được bác sĩ xem.
async function assertTestsReviewed(sessionId) {
    const row = await (0, query_1.queryOne)(`SELECT
        COUNT(*) FILTER (
          WHERE toi.status IN ('not_started','waiting','processing')
        ) AS pending,
        COUNT(*) FILTER (
          WHERE toi.status = 'completed'
            AND toi.result_reviewed_by_doctor = FALSE
        ) AS unreviewed
       FROM test_order_items toi
       JOIN test_orders t ON t.id = toi.test_order_id
      WHERE t.session_id = $1`, [sessionId]);
    if (row && Number(row.pending) > 0)
        throw new error_1.AppError(409, 'Còn xét nghiệm chưa có kết quả — chưa thể cấp đơn thuốc');
    if (row && Number(row.unreviewed) > 0)
        throw new error_1.AppError(409, 'Còn kết quả xét nghiệm bác sĩ chưa xác nhận đã xem');
}
async function loadDetail(id) {
    const p = await (0, query_1.queryOne)('SELECT * FROM prescriptions WHERE id = $1', [id]);
    if (!p)
        throw new error_1.AppError(404, 'Đơn thuốc không tồn tại');
    const items = await (0, query_1.query)(`SELECT pi.*, m.name AS medicine_name
       FROM prescription_items pi
       JOIN lib_medicines m ON m.id = pi.medicine_id
      WHERE pi.prescription_id = $1`, [id]);
    return { ...p, items };
}
async function createPrescription(input, actor) {
    if (actor.role !== 'doctor')
        throw new error_1.AppError(403, 'Chỉ bác sĩ được cấp đơn thuốc');
    await loadOwnedSession(input.session_id, actor);
    await assertTestsReviewed(input.session_id);
    // Validate thuốc tồn tại trước transaction để fail nhanh không cần lock.
    for (const it of input.items) {
        const m = await (0, query_1.queryOne)('SELECT id FROM lib_medicines WHERE id = $1', [
            it.medicine_id,
        ]);
        if (!m)
            throw new error_1.AppError(404, `Thuốc ${it.medicine_id} không tồn tại`);
    }
    // Wrap INSERT trong transaction + dựa vào UNIQUE constraint của session_id
    // để chống race condition (2 request gần đồng thời cùng pass check rồi cùng
    // INSERT). Bắt unique-violation → throw 409 thay vì 500.
    let created;
    try {
        created = await (0, query_1.withTransaction)(async (client) => {
            const p = await client.query(`INSERT INTO prescriptions (session_id, general_note)
         VALUES ($1, $2) RETURNING *`, [input.session_id, input.general_note ?? null]);
            const presc = p.rows[0];
            for (const it of input.items) {
                await client.query(`INSERT INTO prescription_items
             (prescription_id, medicine_id, quantity, usage_instruction)
           VALUES ($1, $2, $3, $4)`, [presc.id, it.medicine_id, it.quantity, it.usage_instruction ?? null]);
            }
            return presc;
        });
    }
    catch (err) {
        // PostgreSQL unique_violation = '23505'.
        if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
            throw new error_1.AppError(409, 'Đợt khám đã có đơn thuốc');
        }
        throw err;
    }
    return loadDetail(created.id);
}
async function getPrescription(id, actor) {
    const detail = await loadDetail(id);
    const session = await (0, query_1.queryOne)('SELECT * FROM examination_sessions WHERE id = $1', [detail.session_id]);
    if (!session)
        throw new error_1.AppError(404, 'Đợt khám không tồn tại');
    if (actor.role === 'patient') {
        const pid = await patientIdOfUser(actor.sub);
        if (session.patient_id !== pid)
            throw new error_1.AppError(403, 'Không có quyền');
    }
    else if (actor.role === 'doctor') {
        const did = await doctorIdOfUser(actor.sub);
        if (session.doctor_id !== did)
            throw new error_1.AppError(403, 'Không có quyền');
    }
    else {
        throw new error_1.AppError(403, 'Không có quyền');
    }
    return detail;
}
async function listBySession(sessionId, actor) {
    const p = await (0, query_1.queryOne)('SELECT * FROM prescriptions WHERE session_id = $1', [sessionId]);
    if (!p)
        return null;
    return getPrescription(p.id, actor);
}
async function updatePrescription(id, input, actor) {
    if (actor.role !== 'doctor')
        throw new error_1.AppError(403, 'Chỉ bác sĩ được sửa đơn thuốc');
    const presc = await (0, query_1.queryOne)('SELECT * FROM prescriptions WHERE id = $1', [id]);
    if (!presc)
        throw new error_1.AppError(404, 'Đơn thuốc không tồn tại');
    await loadOwnedSession(presc.session_id, actor);
    if (input.items) {
        for (const it of input.items) {
            const m = await (0, query_1.queryOne)('SELECT id FROM lib_medicines WHERE id = $1', [
                it.medicine_id,
            ]);
            if (!m)
                throw new error_1.AppError(404, `Thuốc ${it.medicine_id} không tồn tại`);
        }
    }
    await (0, query_1.withTransaction)(async (client) => {
        if (input.general_note !== undefined) {
            await client.query('UPDATE prescriptions SET general_note = $1 WHERE id = $2', [input.general_note, id]);
        }
        if (input.items) {
            await client.query('DELETE FROM prescription_items WHERE prescription_id = $1', [id]);
            for (const it of input.items) {
                await client.query(`INSERT INTO prescription_items
             (prescription_id, medicine_id, quantity, usage_instruction)
           VALUES ($1, $2, $3, $4)`, [id, it.medicine_id, it.quantity, it.usage_instruction ?? null]);
            }
        }
    });
    return loadDetail(id);
}
//# sourceMappingURL=prescriptions.service.js.map