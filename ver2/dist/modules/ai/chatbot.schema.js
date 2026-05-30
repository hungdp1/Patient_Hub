"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestDoctorSchema = exports.askLibrarySchema = exports.symptomQuerySchema = void 0;
const zod_1 = require("zod");
exports.symptomQuerySchema = zod_1.z.object({
    symptoms: zod_1.z.string().min(3, 'Vui lòng mô tả triệu chứng (tối thiểu 3 ký tự)'),
});
exports.askLibrarySchema = zod_1.z.object({
    topic: zod_1.z.enum(['disease', 'medicine', 'procedure', 'test_type']),
    q: zod_1.z.string().min(1, 'Cần từ khóa tìm kiếm'),
});
exports.suggestDoctorSchema = zod_1.z.object({
    department_id: zod_1.z.string().uuid('department_id không hợp lệ'),
    appointment_date: zod_1.z.string().date('Ngày không hợp lệ'),
});
//# sourceMappingURL=chatbot.schema.js.map