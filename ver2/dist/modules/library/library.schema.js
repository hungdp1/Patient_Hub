"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listNameQuerySchema = exports.updateProcedureSchema = exports.createProcedureSchema = exports.updateTestTypeSchema = exports.createTestTypeSchema = exports.updateMedicineSchema = exports.createMedicineSchema = exports.listDiseaseQuerySchema = exports.updateDiseaseSchema = exports.createDiseaseSchema = exports.idParamSchema = void 0;
const zod_1 = require("zod");
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('ID không hợp lệ'),
});
const priceField = zod_1.z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Giá phải là số không âm, tối đa 2 chữ số thập phân');
// ─── Diseases ───────────────────────────────────────────────────────────────
exports.createDiseaseSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Tên bệnh không được để trống').max(255),
    symptoms: zod_1.z.string().nullable().optional(),
    description: zod_1.z.string().nullable().optional(),
    treatment: zod_1.z.string().nullable().optional(),
    department_id: zod_1.z.string().uuid('department_id không hợp lệ').nullable().optional(),
});
exports.updateDiseaseSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255).optional(),
    symptoms: zod_1.z.string().nullable().optional(),
    description: zod_1.z.string().nullable().optional(),
    treatment: zod_1.z.string().nullable().optional(),
    department_id: zod_1.z.string().uuid().nullable().optional(),
});
exports.listDiseaseQuerySchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    department_id: zod_1.z.string().uuid().optional(),
});
// ─── Medicines ───────────────────────────────────────────────────────────────
exports.createMedicineSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Tên thuốc không được để trống').max(255),
    description: zod_1.z.string().nullable().optional(),
    usage: zod_1.z.string().nullable().optional(),
    side_effects: zod_1.z.string().nullable().optional(),
    price: priceField,
    insurance_price: priceField,
});
exports.updateMedicineSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255).optional(),
    description: zod_1.z.string().nullable().optional(),
    usage: zod_1.z.string().nullable().optional(),
    side_effects: zod_1.z.string().nullable().optional(),
    price: priceField.optional(),
    insurance_price: priceField.optional(),
});
// ─── Test Types ───────────────────────────────────────────────────────────────
exports.createTestTypeSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Tên loại xét nghiệm không được để trống').max(255),
    description: zod_1.z.string().nullable().optional(),
    estimated_minutes: zod_1.z.number().int().positive().default(30),
    price: priceField,
    insurance_price: priceField,
});
exports.updateTestTypeSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255).optional(),
    description: zod_1.z.string().nullable().optional(),
    estimated_minutes: zod_1.z.number().int().positive().optional(),
    price: priceField.optional(),
    insurance_price: priceField.optional(),
});
// ─── Procedures ──────────────────────────────────────────────────────────────
exports.createProcedureSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Tên quy trình không được để trống').max(255),
    description: zod_1.z.string().nullable().optional(),
});
exports.updateProcedureSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255).optional(),
    description: zod_1.z.string().nullable().optional(),
});
exports.listNameQuerySchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
});
//# sourceMappingURL=library.schema.js.map