"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSessionSchema = exports.patientIdParamSchema = exports.idParamSchema = void 0;
const zod_1 = require("zod");
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('ID không hợp lệ'),
});
exports.patientIdParamSchema = zod_1.z.object({
    patientId: zod_1.z.string().uuid('patientId không hợp lệ'),
});
// Bác sĩ chỉ được sửa chẩn đoán + kế hoạch điều trị (dạng text), khi còn nháp.
exports.updateSessionSchema = zod_1.z
    .object({
    diagnosis: zod_1.z.string().max(5000).nullable().optional(),
    treatment_plan: zod_1.z.string().max(5000).nullable().optional(),
})
    .refine((d) => d.diagnosis !== undefined || d.treatment_plan !== undefined, {
    message: 'Không có thông tin cần cập nhật',
});
//# sourceMappingURL=examination.schema.js.map