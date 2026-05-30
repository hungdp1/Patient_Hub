"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionDetail = getSessionDetail;
exports.listMySessions = listMySessions;
exports.listSessionsByPatient = listSessionsByPatient;
exports.getMyMedicalHistory = getMyMedicalHistory;
exports.getMedicalHistory = getMedicalHistory;
exports.updateSession = updateSession;
exports.finalizeSession = finalizeSession;
const query_1 = require("../../db/query");
const error_1 = require("../../middleware/error");
const notification_helper_1 = require("../notifications/notification.helper");
async function patientIdOfUser(userId) {
    const row = await (0, query_1.queryOne)('SELECT id FROM patients WHERE user_id = $1', [userId]);
    if (!row)
        throw new error_1.AppError(404, 'Không tìm thấy hồ sơ bệnh nhân');
    return row.id;
}
async function doctorIdOfUser(userId) {
    const row = await (0, query_1.queryOne)('SELECT id FROM doctors WHERE user_id = $1', [userId]);
    if (!row)
        throw new error_1.AppError(404, 'Không tìm thấy hồ sơ bác sĩ');
    return row.id;
}
// Bác sĩ chỉ có quyền với đợt khám mình đang phụ trách; bệnh nhân chỉ xem của mình.
// Quản lý KHÔNG được truy cập hồ sơ bệnh án.
async function authorizeSession(session, actor) {
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
        throw new error_1.AppError(403, 'Không có quyền xem hồ sơ bệnh án');
    }
}
async function getSessionDetail(id, actor) {
    const session = await (0, query_1.queryOne)('SELECT * FROM examination_sessions WHERE id = $1', [id]);
    if (!session)
        throw new error_1.AppError(404, 'Đợt khám không tồn tại');
    await authorizeSession(session, actor);
    const orders = await (0, query_1.query)('SELECT id, note, created_at FROM test_orders WHERE session_id = $1 ORDER BY created_at ASC', [id]);
    const test_orders = [];
    for (const o of orders) {
        const items = await (0, query_1.query)(`SELECT toi.*, tt.name AS test_type_name, lr.name AS lab_room_name
         FROM test_order_items toi
         JOIN lib_test_types tt ON tt.id = toi.test_type_id
         LEFT JOIN lab_rooms lr ON lr.id = toi.lab_room_id
        WHERE toi.test_order_id = $1
        ORDER BY toi.schedule_order ASC NULLS LAST`, [o.id]);
        test_orders.push({ ...o, items });
    }
    const pres = await (0, query_1.queryOne)('SELECT id, general_note, created_at FROM prescriptions WHERE session_id = $1', [
        id,
    ]);
    let prescription = null;
    if (pres) {
        const pitems = await (0, query_1.query)(`SELECT pi.*, m.name AS medicine_name
         FROM prescription_items pi
         JOIN lib_medicines m ON m.id = pi.medicine_id
        WHERE pi.prescription_id = $1`, [pres.id]);
        prescription = { ...pres, items: pitems };
    }
    return { ...session, test_orders, prescription };
}
// Bệnh nhân: danh sách các đợt khám (hồ sơ bệnh án).
async function listMySessions(actor) {
    const pid = await patientIdOfUser(actor.sub);
    return (0, query_1.query)(`SELECT es.*, a.appointment_date
       FROM examination_sessions es
       JOIN appointments a ON a.id = es.appointment_id
      WHERE es.patient_id = $1
      ORDER BY a.appointment_date DESC, es.created_at DESC`, [pid]);
}
// Bác sĩ tra cứu hồ sơ bệnh nhân để khám.
async function listSessionsByPatient(patientId, actor) {
    if (actor.role !== 'doctor')
        throw new error_1.AppError(403, 'Chỉ bác sĩ được tra cứu hồ sơ bệnh nhân');
    return (0, query_1.query)(`SELECT es.*, a.appointment_date
       FROM examination_sessions es
       JOIN appointments a ON a.id = es.appointment_id
      WHERE es.patient_id = $1
      ORDER BY a.appointment_date DESC, es.created_at DESC`, [patientId]);
}
async function getMyMedicalHistory(actor) {
    const pid = await patientIdOfUser(actor.sub);
    return getMedicalHistory(pid);
}
// Tiền sử bệnh = chẩn đoán cuối của các đợt khám đã chốt.
async function getMedicalHistory(patientId) {
    return (0, query_1.query)(`SELECT id AS session_id, diagnosis, finalized_at
       FROM examination_sessions
      WHERE patient_id = $1 AND is_finalized = TRUE
        AND diagnosis IS NOT NULL AND diagnosis <> ''
      ORDER BY finalized_at DESC`, [patientId]);
}
async function updateSession(id, actor, input) {
    if (actor.role !== 'doctor')
        throw new error_1.AppError(403, 'Chỉ bác sĩ được cập nhật đợt khám');
    const session = await (0, query_1.queryOne)('SELECT * FROM examination_sessions WHERE id = $1', [id]);
    if (!session)
        throw new error_1.AppError(404, 'Đợt khám không tồn tại');
    const did = await doctorIdOfUser(actor.sub);
    if (session.doctor_id !== did)
        throw new error_1.AppError(403, 'Đây không phải đợt khám của bạn');
    if (session.is_finalized)
        throw new error_1.AppError(409, 'Đợt khám đã chốt, không thể chỉnh sửa');
    const sets = [];
    const params = [];
    let i = 1;
    if (input.diagnosis !== undefined) {
        sets.push(`diagnosis = $${i++}`);
        params.push(input.diagnosis);
    }
    if (input.treatment_plan !== undefined) {
        sets.push(`treatment_plan = $${i++}`);
        params.push(input.treatment_plan);
    }
    if (sets.length === 0)
        throw new error_1.AppError(400, 'Không có thông tin cần cập nhật');
    params.push(id);
    const row = await (0, query_1.queryOne)(`UPDATE examination_sessions SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, params);
    return row;
}
// Bác sĩ xác nhận lưu đợt khám → 'đã khám'. Lịch hẹn chuyển done, báo bệnh nhân.
async function finalizeSession(id, actor) {
    if (actor.role !== 'doctor')
        throw new error_1.AppError(403, 'Chỉ bác sĩ được chốt đợt khám');
    const session = await (0, query_1.queryOne)('SELECT * FROM examination_sessions WHERE id = $1', [id]);
    if (!session)
        throw new error_1.AppError(404, 'Đợt khám không tồn tại');
    const did = await doctorIdOfUser(actor.sub);
    if (session.doctor_id !== did)
        throw new error_1.AppError(403, 'Đây không phải đợt khám của bạn');
    if (session.is_finalized)
        throw new error_1.AppError(409, 'Đợt khám đã được chốt trước đó');
    // Mọi xét nghiệm phải có kết quả trước khi chốt.
    const pending = await (0, query_1.queryOne)(`SELECT COUNT(*) AS cnt
       FROM test_order_items toi
       JOIN test_orders t ON t.id = toi.test_order_id
      WHERE t.session_id = $1
        AND toi.status IN ('not_started', 'waiting', 'processing')`, [id]);
    if (pending && Number(pending.cnt) > 0)
        throw new error_1.AppError(409, 'Còn xét nghiệm chưa có kết quả — chưa thể chốt đợt khám');
    const row = await (0, query_1.queryOne)(`UPDATE examination_sessions
        SET is_finalized = TRUE, finalized_at = NOW()
      WHERE id = $1 RETURNING *`, [id]);
    await (0, query_1.query)(`UPDATE appointments SET status = 'done' WHERE id = $1`, [session.appointment_id]);
    const u = await (0, query_1.queryOne)('SELECT user_id FROM patients WHERE id = $1', [session.patient_id]);
    if (u)
        await (0, notification_helper_1.notifyUser)(u.user_id, 'Hoàn tất khám', 'Cảm ơn bạn đã sử dụng dịch vụ. Vui lòng thanh toán nếu chưa hoàn tất.');
    return row;
}
//# sourceMappingURL=examination.service.js.map