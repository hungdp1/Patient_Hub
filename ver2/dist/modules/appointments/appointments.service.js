"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppointment = createAppointment;
exports.listAppointments = listAppointments;
exports.getAppointment = getAppointment;
exports.startExamination = startExamination;
exports.cancelAppointment = cancelAppointment;
exports.reassignDoctor = reassignDoctor;
exports.expireOverdueAppointments = expireOverdueAppointments;
const query_1 = require("../../db/query");
const error_1 = require("../../middleware/error");
const notification_helper_1 = require("../notifications/notification.helper");
const ai_stub_1 = require("../ai/ai.stub");
const ACTIVE = ['pending', 'confirmed', 'in_progress'];
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
async function patientUserId(patientId) {
    const row = await (0, query_1.queryOne)('SELECT user_id FROM patients WHERE id = $1', [patientId]);
    if (!row)
        throw new error_1.AppError(404, 'Bệnh nhân không tồn tại');
    return row.user_id;
}
// Variant không throw — dùng trong loop của cron / batch để 1 record lỗi
// không làm dừng cả vòng lặp.
async function patientUserIdSafe(patientId) {
    const row = await (0, query_1.queryOne)('SELECT user_id FROM patients WHERE id = $1', [patientId]);
    return row?.user_id ?? null;
}
// Chọn bác sĩ cân tải trong khoa: bỏ qua bác sĩ bị khóa hoặc tạm dừng auto-schedule,
// ưu tiên người ít lịch nhất trong ngày (chưa vượt max_appointments_per_day),
// rồi ít lịch tổng.
async function autoAssignDoctor(departmentId, date, patientId) {
    const row = await (0, query_1.queryOne)(`SELECT d.id,
            COUNT(DISTINCT ad.id) AS day_load,
            COUNT(DISTINCT aa.id) AS total_load
       FROM doctors d
       JOIN users u ON u.id = d.user_id
        AND u.is_active = TRUE
        AND u.auto_schedule_paused = FALSE
       LEFT JOIN appointments ad ON ad.doctor_id = d.id
        AND ad.appointment_date = $2
        AND ad.status = ANY($3::appointment_status[])
       LEFT JOIN appointments aa ON aa.doctor_id = d.id
        AND aa.status = ANY($3::appointment_status[])
      WHERE d.department_id = $1
        AND NOT EXISTS (
          SELECT 1 FROM appointments x
           WHERE x.doctor_id = d.id AND x.patient_id = $4
             AND x.appointment_date = $2
             AND x.status = ANY($3::appointment_status[])
        )
      GROUP BY d.id
      HAVING COUNT(DISTINCT ad.id) < d.max_appointments_per_day
      ORDER BY day_load ASC, total_load ASC, d.id ASC
      LIMIT 1`, [departmentId, date, ACTIVE, patientId]);
    if (!row)
        throw new error_1.AppError(409, 'Hết bác sĩ khả dụng tại khoa cho ngày đã chọn');
    return row.id;
}
async function createAppointment(input, actor) {
    let patientId;
    let createdBy;
    if (actor.role === 'patient') {
        patientId = await patientIdOfUser(actor.sub);
        createdBy = 'patient';
    }
    else if (actor.role === 'receptionist' || actor.role === 'manager') {
        if (!input.patient_id)
            throw new error_1.AppError(400, 'Cần patient_id khi tạo hộ bệnh nhân');
        const exists = await (0, query_1.queryOne)('SELECT id FROM patients WHERE id = $1', [
            input.patient_id,
        ]);
        if (!exists)
            throw new error_1.AppError(404, 'Bệnh nhân không tồn tại');
        patientId = input.patient_id;
        createdBy = actor.role;
    }
    else {
        throw new error_1.AppError(403, 'Không có quyền tạo lịch hẹn');
    }
    // Bệnh nhân phải rảnh ngày hôm đó.
    const clash = await (0, query_1.queryOne)(`SELECT id FROM appointments
      WHERE patient_id = $1 AND appointment_date = $2
        AND status = ANY($3::appointment_status[])`, [patientId, input.appointment_date, ACTIVE]);
    if (clash)
        throw new error_1.AppError(409, 'Bệnh nhân đã có lịch hẹn trong ngày này');
    let doctorId;
    if (input.doctor_id) {
        const doc = await (0, query_1.queryOne)(`SELECT d.id, d.max_appointments_per_day AS max_per_day
         FROM doctors d
         JOIN users u ON u.id = d.user_id AND u.is_active = TRUE
        WHERE d.id = $1`, [input.doctor_id]);
        if (!doc)
            throw new error_1.AppError(404, 'Bác sĩ không tồn tại hoặc đã bị khóa');
        const dup = await (0, query_1.queryOne)(`SELECT id FROM appointments
        WHERE doctor_id = $1 AND patient_id = $2 AND appointment_date = $3
          AND status = ANY($4::appointment_status[])`, [
            input.doctor_id,
            patientId,
            input.appointment_date,
            ACTIVE,
        ]);
        if (dup)
            throw new error_1.AppError(409, 'Bác sĩ này đã có hẹn với bệnh nhân trong ngày');
        // Kiểm tra max_appointments_per_day kể cả khi chỉ định trực tiếp.
        const load = await (0, query_1.queryOne)(`SELECT COUNT(*) AS n FROM appointments
        WHERE doctor_id = $1 AND appointment_date = $2
          AND status = ANY($3::appointment_status[])`, [input.doctor_id, input.appointment_date, ACTIVE]);
        if (load && Number(load.n) >= doc.max_per_day) {
            throw new error_1.AppError(409, 'Bác sĩ đã đạt giới hạn lịch trong ngày');
        }
        doctorId = input.doctor_id;
    }
    else {
        let departmentId = input.department_id ?? null;
        if (!departmentId && input.symptoms) {
            const pred = await (0, ai_stub_1.predictDiseaseDepartment)(input.symptoms);
            departmentId = pred.departmentId;
        }
        if (!departmentId)
            throw new error_1.AppError(400, 'Chưa xác định được khoa — vui lòng chọn khoa khám');
        doctorId = await autoAssignDoctor(departmentId, input.appointment_date, patientId);
    }
    const row = await (0, query_1.queryOne)(`INSERT INTO appointments (patient_id, doctor_id, appointment_date, status, created_by_role)
     VALUES ($1, $2, $3, 'pending', $4) RETURNING *`, [patientId, doctorId, input.appointment_date, createdBy]);
    return row;
}
async function listAppointments(actor, q) {
    const where = [];
    const params = [];
    let i = 1;
    if (actor.role === 'patient') {
        const pid = await patientIdOfUser(actor.sub);
        where.push(`a.patient_id = $${i++}`);
        params.push(pid);
        // Done/cancelled/expired bị ẩn khỏi màn hình hẹn của bệnh nhân.
        if (q.all !== 'true') {
            where.push(`a.status = ANY($${i++}::appointment_status[])`);
            params.push(ACTIVE);
        }
    }
    else if (actor.role === 'doctor') {
        const did = await doctorIdOfUser(actor.sub);
        where.push(`a.doctor_id = $${i++}`);
        params.push(did);
        // Quá hẹn/hủy/đã khám tự biến mất khỏi danh sách bác sĩ.
        where.push(`a.status = ANY($${i++}::appointment_status[])`);
        params.push(ACTIVE);
    }
    else if (actor.role === 'manager' || actor.role === 'receptionist') {
        // Xem tổng hợp toàn hệ thống.
    }
    else {
        throw new error_1.AppError(403, 'Không có quyền xem lịch hẹn');
    }
    if (q.status) {
        where.push(`a.status = $${i++}`);
        params.push(q.status);
    }
    if (q.date) {
        where.push(`a.appointment_date = $${i++}`);
        params.push(q.date);
    }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    return (0, query_1.query)(`SELECT a.*, p.full_name AS patient_name, d.full_name AS doctor_name
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN doctors d  ON d.id = a.doctor_id
       ${clause}
      ORDER BY a.appointment_date ASC, a.created_at ASC`, params);
}
async function loadForActor(id, actor) {
    const row = await (0, query_1.queryOne)('SELECT * FROM appointments WHERE id = $1', [id]);
    if (!row)
        throw new error_1.AppError(404, 'Lịch hẹn không tồn tại');
    if (actor.role === 'patient') {
        const pid = await patientIdOfUser(actor.sub);
        if (row.patient_id !== pid)
            throw new error_1.AppError(403, 'Không có quyền');
    }
    else if (actor.role === 'doctor') {
        const did = await doctorIdOfUser(actor.sub);
        if (row.doctor_id !== did)
            throw new error_1.AppError(403, 'Không có quyền');
    }
    else if (actor.role !== 'manager' && actor.role !== 'receptionist') {
        throw new error_1.AppError(403, 'Không có quyền');
    }
    return row;
}
function getAppointment(id, actor) {
    return loadForActor(id, actor);
}
// Bác sĩ chuyển 'đã đặt' → 'đang khám'; tự tạo đợt khám nháp.
// Cho phép start trong khoảng [hôm nay; appointment_date] để bác sĩ chấp nhận
// bệnh nhân đến sớm cùng ngày, nhưng không start trước nhiều ngày (tạo session
// nháp lơ lửng) và không start sau (đã quá hạn → expired qua cron).
async function startExamination(id, actor) {
    if (actor.role !== 'doctor')
        throw new error_1.AppError(403, 'Chỉ bác sĩ được bắt đầu khám');
    const did = await doctorIdOfUser(actor.sub);
    const appt = await (0, query_1.queryOne)('SELECT * FROM appointments WHERE id = $1', [id]);
    if (!appt)
        throw new error_1.AppError(404, 'Lịch hẹn không tồn tại');
    if (appt.doctor_id !== did)
        throw new error_1.AppError(403, 'Đây không phải lịch hẹn của bạn');
    if (appt.status !== 'pending')
        throw new error_1.AppError(409, 'Chỉ bắt đầu khám khi lịch đang ở trạng thái đã đặt');
    // appointment_date là DATE local — so sánh bằng ngày VN từ DB để tránh lệch TZ.
    const today = await (0, query_1.queryOne)(`SELECT (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date::text AS today`);
    if (today && appt.appointment_date !== today.today)
        throw new error_1.AppError(409, 'Chỉ bắt đầu khám đúng ngày hẹn');
    return (0, query_1.withTransaction)(async (client) => {
        const a = await client.query(`UPDATE appointments SET status = 'in_progress' WHERE id = $1 RETURNING *`, [id]);
        const s = await client.query(`INSERT INTO examination_sessions (appointment_id, patient_id, doctor_id)
       VALUES ($1, $2, $3) RETURNING *`, [id, appt.patient_id, appt.doctor_id]);
        return { appointment: a.rows[0], session: s.rows[0] };
    });
}
async function cancelAppointment(id, actor) {
    const appt = await (0, query_1.queryOne)('SELECT * FROM appointments WHERE id = $1', [id]);
    if (!appt)
        throw new error_1.AppError(404, 'Lịch hẹn không tồn tại');
    if (actor.role === 'patient') {
        const pid = await patientIdOfUser(actor.sub);
        if (appt.patient_id !== pid)
            throw new error_1.AppError(403, 'Không có quyền');
        if (!['pending', 'confirmed'].includes(appt.status))
            throw new error_1.AppError(409, 'Chỉ hủy được lịch khi đang ở trạng thái đã đặt');
    }
    else if (actor.role === 'manager') {
        if (appt.status !== 'pending')
            throw new error_1.AppError(409, 'Chỉ hủy được lịch ở trạng thái đã đặt');
    }
    else {
        throw new error_1.AppError(403, 'Không có quyền hủy lịch hẹn');
    }
    const row = await (0, query_1.queryOne)(`UPDATE appointments SET status = 'cancelled' WHERE id = $1 RETURNING *`, [id]);
    if (actor.role === 'manager') {
        const uid = await patientUserId(appt.patient_id);
        await (0, notification_helper_1.notifyUser)(uid, 'Lịch hẹn bị hủy', 'Lịch hẹn của bạn đã bị hủy bởi quản lý. Vui lòng đặt lịch mới.');
    }
    return row;
}
// Quản lý đổi bác sĩ cho lịch hẹn; thông báo để bệnh nhân chấp nhận hoặc tự hủy.
async function reassignDoctor(id, newDoctorId, actor) {
    if (actor.role !== 'manager')
        throw new error_1.AppError(403, 'Chỉ quản lý được đổi bác sĩ');
    const appt = await (0, query_1.queryOne)('SELECT * FROM appointments WHERE id = $1', [id]);
    if (!appt)
        throw new error_1.AppError(404, 'Lịch hẹn không tồn tại');
    if (appt.status !== 'pending')
        throw new error_1.AppError(409, 'Chỉ đổi bác sĩ khi lịch ở trạng thái đã đặt');
    // Bác sĩ mới phải cùng khoa với bác sĩ hiện tại — tránh chuyển bệnh nhân
    // khám Tim sang bác sĩ Răng-hàm-mặt do nhầm lẫn.
    const current = await (0, query_1.queryOne)('SELECT department_id FROM doctors WHERE id = $1', [appt.doctor_id]);
    const doc = await (0, query_1.queryOne)(`SELECT d.id, d.department_id FROM doctors d
       JOIN users u ON u.id = d.user_id AND u.is_active = TRUE
      WHERE d.id = $1`, [newDoctorId]);
    if (!doc)
        throw new error_1.AppError(404, 'Bác sĩ thay thế không tồn tại hoặc bị khóa');
    if (newDoctorId === appt.doctor_id)
        throw new error_1.AppError(400, 'Bác sĩ mới trùng bác sĩ hiện tại');
    if (current && doc.department_id !== current.department_id)
        throw new error_1.AppError(400, 'Bác sĩ thay thế phải thuộc cùng khoa');
    const dup = await (0, query_1.queryOne)(`SELECT id FROM appointments
      WHERE doctor_id = $1 AND patient_id = $2 AND appointment_date = $3
        AND status = ANY($4::appointment_status[])`, [
        newDoctorId,
        appt.patient_id,
        appt.appointment_date,
        ACTIVE,
    ]);
    if (dup)
        throw new error_1.AppError(409, 'Bác sĩ này đã có hẹn với bệnh nhân — hãy chọn bác sĩ khác');
    const row = await (0, query_1.queryOne)('UPDATE appointments SET doctor_id = $1 WHERE id = $2 RETURNING *', [newDoctorId, id]);
    const uid = await patientUserId(appt.patient_id);
    await (0, notification_helper_1.notifyUser)(uid, 'Lịch hẹn được đổi bác sĩ', 'Bác sĩ phụ trách lịch hẹn của bạn đã được thay đổi. Nếu không đồng ý, vui lòng hủy để đặt lại.');
    return row;
}
// Cron mỗi 1h: lịch 'đã đặt' quá ngày → expired + báo bệnh nhân đặt mới.
// Dùng ngày VN từ DB (Asia/Ho_Chi_Minh) thay vì UTC để tránh lệch ±7h.
async function expireOverdueAppointments() {
    const rows = await (0, query_1.query)(`UPDATE appointments
        SET status = 'expired'
      WHERE status IN ('pending', 'confirmed')
        AND appointment_date < (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
      RETURNING id, patient_id`);
    for (const r of rows) {
        try {
            const uid = await patientUserIdSafe(r.patient_id);
            if (uid) {
                await (0, notification_helper_1.notifyUser)(uid, 'Lịch hẹn quá hạn', 'Lịch hẹn của bạn đã quá hạn và bị hủy. Vui lòng đặt lịch mới.');
            }
        }
        catch (err) {
            // Không để 1 patient lỗi làm dừng cả batch — log và tiếp tục.
            console.error(`⚠️ Lỗi notify expire cho patient ${r.patient_id}:`, err);
        }
    }
    return rows.length;
}
//# sourceMappingURL=appointments.service.js.map