"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeSymptoms = analyzeSymptoms;
exports.askLibrary = askLibrary;
exports.suggestDoctor = suggestDoctor;
const query_1 = require("../../db/query");
const error_1 = require("../../middleware/error");
const ai_stub_1 = require("./ai.stub");
// Bước 1: bệnh nhân nhập triệu chứng. Hệ thống dùng AI predict.
// Output gợi ý khoa / lời khuyên / cần đi viện hay không.
async function analyzeSymptoms(q, actor) {
    if (actor.role !== 'patient')
        throw new error_1.AppError(403, 'Chỉ bệnh nhân dùng chatbot');
    const pred = await (0, ai_stub_1.predictDiseaseDepartment)(q.symptoms);
    let dept = null;
    if (pred.departmentId) {
        dept = await (0, query_1.queryOne)('SELECT * FROM departments WHERE id = $1', [pred.departmentId]);
    }
    return {
        needs_hospital: dept !== null,
        suggested_department: dept,
        disease_name: pred.diseaseName,
        advice: pred.advice,
    };
}
// Bước 2: bệnh nhân tra cứu thư viện qua chatbot.
async function askLibrary(q) {
    const like = `%${q.q.toLowerCase()}%`;
    switch (q.topic) {
        case 'disease':
            return (0, query_1.query)(`SELECT * FROM lib_diseases
          WHERE LOWER(name) LIKE $1 OR LOWER(symptoms) LIKE $1
          ORDER BY name LIMIT 20`, [like]);
        case 'medicine':
            return (0, query_1.query)(`SELECT * FROM lib_medicines
          WHERE LOWER(name) LIKE $1 OR LOWER(description) LIKE $1
          ORDER BY name LIMIT 20`, [like]);
        case 'procedure':
            return (0, query_1.query)(`SELECT * FROM lib_procedures
          WHERE LOWER(name) LIKE $1 OR LOWER(description) LIKE $1
          ORDER BY name LIMIT 20`, [like]);
        case 'test_type':
            return (0, query_1.query)(`SELECT * FROM lib_test_types
          WHERE LOWER(name) LIKE $1 OR LOWER(description) LIKE $1
          ORDER BY name LIMIT 20`, [like]);
    }
}
// Bước 3: load-balancing — gợi ý bác sĩ ít lịch nhất trong khoa cho ngày đã chọn,
// loại bỏ bác sĩ auto_schedule_paused.
async function suggestDoctor(q, actor) {
    if (actor.role !== 'patient')
        throw new error_1.AppError(403, 'Chỉ bệnh nhân dùng chatbot');
    const dept = await (0, query_1.queryOne)('SELECT id FROM departments WHERE id = $1', [q.department_id]);
    if (!dept)
        throw new error_1.AppError(404, 'Khoa không tồn tại');
    // Đếm lịch chưa đóng của từng bác sĩ trong khoa cho ngày đó.
    return (0, query_1.queryOne)(`SELECT d.*
       FROM doctors d
       JOIN users u ON u.id = d.user_id
       LEFT JOIN appointments a
              ON a.doctor_id = d.id
             AND a.appointment_date = $2
             AND a.status IN ('pending','confirmed','in_progress')
      WHERE d.department_id = $1
        AND u.is_active = TRUE
        AND u.auto_schedule_paused = FALSE
      GROUP BY d.id
      ORDER BY COUNT(a.id) ASC, d.full_name ASC
      LIMIT 1`, [q.department_id, q.appointment_date]);
}
//# sourceMappingURL=chatbot.service.js.map