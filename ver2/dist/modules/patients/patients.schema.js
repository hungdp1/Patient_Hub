"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePatientSchema = exports.createPatientSchema = exports.listPatientQuerySchema = exports.idParamSchema = void 0;
const zod_1 = require("zod");
const phone = zod_1.z
    .string()
    .regex(/^0\d{9}$/, 'Số điện thoại phải gồm 10 chữ số bắt đầu bằng 0');
const dateStr = (label) => zod_1.z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, `${label} phải có dạng YYYY-MM-DD`)
    .refine((v) => !Number.isNaN(Date.parse(v)), `${label} không hợp lệ`);
const gender = zod_1.z.enum(['male', 'female', 'other']);
const priority = zod_1.z.enum(['1', '2', '3', '4', '5']);
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('ID không hợp lệ'),
});
exports.listPatientQuerySchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
});
exports.createPatientSchema = zod_1.z.object({
    full_name: zod_1.z.string().min(1, 'Họ tên không được để trống').max(255),
    date_of_birth: dateStr('Ngày sinh'),
    gender,
    blood_type: zod_1.z.string().max(5).nullable().optional(),
    address: zod_1.z.string().max(500).nullable().optional(),
    phone,
    insurance_number: zod_1.z.string().min(1).max(50).nullable().optional(),
    insurance_expiry: dateStr('Hạn bảo hiểm').nullable().optional(),
    priority_type: priority.nullable().optional(),
});
// Sửa thông tin cần mật khẩu hiện tại của bệnh nhân (theo đặc tả).
// Phải có ít nhất 1 trường ngoài currentPassword.
exports.updatePatientSchema = zod_1.z
    .object({
    currentPassword: zod_1.z.string().min(1, 'Cần mật khẩu hiện tại của bệnh nhân'),
    full_name: zod_1.z.string().min(1).max(255).optional(),
    date_of_birth: dateStr('Ngày sinh').optional(),
    gender: gender.optional(),
    blood_type: zod_1.z.string().max(5).nullable().optional(),
    address: zod_1.z.string().max(500).nullable().optional(),
    phone: phone.optional(),
    insurance_number: zod_1.z.string().min(1).max(50).nullable().optional(),
    insurance_expiry: dateStr('Hạn bảo hiểm').nullable().optional(),
    priority_type: priority.nullable().optional(),
})
    .refine((d) => {
    const { currentPassword: _cp, ...rest } = d;
    return Object.values(rest).some((v) => v !== undefined);
}, { message: 'Cần ít nhất 1 trường để cập nhật' });
//# sourceMappingURL=patients.schema.js.map