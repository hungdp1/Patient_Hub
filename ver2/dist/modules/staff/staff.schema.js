"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBasicStaffSchema = exports.updateTechnicianSchema = exports.createTechnicianSchema = exports.updateDoctorSchema = exports.createDoctorSchema = exports.setActiveSchema = exports.listAccountsQuerySchema = exports.userIdParamSchema = exports.idParamSchema = void 0;
const zod_1 = require("zod");
const username = zod_1.z.string().min(3, 'Username tối thiểu 3 ký tự').max(100);
const password = zod_1.z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự');
const fullName = zod_1.z.string().min(1, 'Họ tên không được để trống').max(255);
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('ID không hợp lệ'),
});
exports.userIdParamSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('userId không hợp lệ'),
});
exports.listAccountsQuerySchema = zod_1.z.object({
    role: zod_1.z
        .enum(['patient', 'doctor', 'technician', 'manager', 'cashier', 'receptionist'])
        .optional(),
    is_active: zod_1.z.enum(['true', 'false']).optional(),
});
exports.setActiveSchema = zod_1.z.object({
    is_active: zod_1.z.boolean(),
});
exports.createDoctorSchema = zod_1.z.object({
    username,
    password,
    full_name: fullName,
    department_id: zod_1.z.string().uuid('department_id không hợp lệ'),
});
exports.updateDoctorSchema = zod_1.z.object({
    full_name: fullName.optional(),
    department_id: zod_1.z.string().uuid().optional(),
    auto_schedule_paused: zod_1.z.boolean().optional(),
});
exports.createTechnicianSchema = zod_1.z.object({
    username,
    password,
    full_name: fullName,
    lab_room_id: zod_1.z.string().uuid('lab_room_id không hợp lệ'),
});
exports.updateTechnicianSchema = zod_1.z.object({
    full_name: fullName.optional(),
    lab_room_id: zod_1.z.string().uuid().optional(),
});
exports.createBasicStaffSchema = zod_1.z.object({
    username,
    password,
});
//# sourceMappingURL=staff.schema.js.map