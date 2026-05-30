"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePrescriptionSchema = exports.createPrescriptionSchema = exports.listQuerySchema = exports.idParamSchema = void 0;
const zod_1 = require("zod");
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('ID không hợp lệ'),
});
exports.listQuerySchema = zod_1.z.object({
    session_id: zod_1.z.string().uuid('session_id không hợp lệ'),
});
const itemSchema = zod_1.z.object({
    medicine_id: zod_1.z.string().uuid('medicine_id không hợp lệ'),
    quantity: zod_1.z.number().int().positive('Số lượng phải > 0'),
    usage_instruction: zod_1.z.string().nullable().optional(),
});
exports.createPrescriptionSchema = zod_1.z.object({
    session_id: zod_1.z.string().uuid('session_id không hợp lệ'),
    general_note: zod_1.z.string().nullable().optional(),
    items: zod_1.z.array(itemSchema).min(1, 'Đơn thuốc cần ít nhất 1 loại thuốc'),
});
exports.updatePrescriptionSchema = zod_1.z
    .object({
    general_note: zod_1.z.string().nullable().optional(),
    items: zod_1.z.array(itemSchema).min(1).optional(),
})
    .refine((d) => d.general_note !== undefined || d.items !== undefined, {
    message: 'Không có thông tin cần cập nhật',
});
//# sourceMappingURL=prescriptions.schema.js.map