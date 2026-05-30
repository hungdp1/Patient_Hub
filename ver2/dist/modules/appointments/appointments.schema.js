"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reassignSchema = exports.createAppointmentSchema = exports.listAppointmentQuerySchema = exports.idParamSchema = void 0;
const zod_1 = require("zod");
const futureDate = zod_1.z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày hẹn phải có dạng YYYY-MM-DD')
    .refine((v) => !Number.isNaN(Date.parse(v)), 'Ngày hẹn không hợp lệ')
    .refine((v) => {
    const today = new Date().toISOString().slice(0, 10);
    return v >= today;
}, 'Ngày hẹn không được ở quá khứ');
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('ID không hợp lệ'),
});
exports.listAppointmentQuerySchema = zod_1.z.object({
    status: zod_1.z
        .enum([
        'pending',
        'confirmed',
        'in_progress',
        'done',
        'cancelled',
        'expired',
    ])
        .optional(),
    date: zod_1.z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
    all: zod_1.z.enum(['true', 'false']).optional(),
});
// Bệnh nhân đặt qua chatbot: cung cấp triệu chứng + (khoa đã xác nhận/tự chọn)
// + ngày rảnh. Hệ thống tự chọn bác sĩ cân tải.
// Tiếp tân/Quản lý tạo: chỉ định patient_id, có thể chỉ định doctor_id.
exports.createAppointmentSchema = zod_1.z
    .object({
    patient_id: zod_1.z.string().uuid().optional(),
    department_id: zod_1.z.string().uuid().optional(),
    doctor_id: zod_1.z.string().uuid().optional(),
    appointment_date: futureDate,
    symptoms: zod_1.z.string().optional(),
})
    .refine((d) => d.department_id || d.doctor_id, {
    message: 'Cần department_id (tự chọn bác sĩ) hoặc doctor_id (chỉ định)',
    path: ['department_id'],
});
exports.reassignSchema = zod_1.z.object({
    doctor_id: zod_1.z.string().uuid('doctor_id không hợp lệ'),
});
//# sourceMappingURL=appointments.schema.js.map