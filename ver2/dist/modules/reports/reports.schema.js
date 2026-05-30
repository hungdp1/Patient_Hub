"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listQuerySchema = exports.createReportSchema = exports.idParamSchema = void 0;
const zod_1 = require("zod");
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('ID không hợp lệ'),
});
exports.createReportSchema = zod_1.z.object({
    content: zod_1.z
        .string()
        .min(5, 'Nội dung báo cáo tối thiểu 5 ký tự')
        .max(5000, 'Nội dung báo cáo tối đa 5000 ký tự'),
});
exports.listQuerySchema = zod_1.z.object({
    status: zod_1.z.enum(['pending', 'resolved']).optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(200).default(50),
});
//# sourceMappingURL=reports.schema.js.map