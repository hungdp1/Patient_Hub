"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateItemStatusSchema = exports.createTestOrderSchema = exports.listBySessionQuerySchema = exports.itemIdParamSchema = exports.idParamSchema = void 0;
const zod_1 = require("zod");
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('ID không hợp lệ'),
});
exports.itemIdParamSchema = zod_1.z.object({
    itemId: zod_1.z.string().uuid('itemId không hợp lệ'),
});
exports.listBySessionQuerySchema = zod_1.z.object({
    session_id: zod_1.z.string().uuid('session_id không hợp lệ'),
});
exports.createTestOrderSchema = zod_1.z.object({
    session_id: zod_1.z.string().uuid('session_id không hợp lệ'),
    note: zod_1.z.string().nullable().optional(),
    test_type_ids: zod_1.z
        .array(zod_1.z.string().uuid('test_type_id không hợp lệ'))
        .min(1, 'Cần ít nhất 1 loại xét nghiệm'),
});
// KTV chuyển trạng thái: not_started → waiting → processing → completed.
// Khi completed bắt buộc có result_data, sau đó không sửa được.
exports.updateItemStatusSchema = zod_1.z
    .object({
    status: zod_1.z.enum(['waiting', 'processing', 'completed']),
    result_data: zod_1.z.unknown().optional(),
})
    .refine((d) => d.status !== 'completed' || d.result_data !== undefined, { message: 'Cần result_data khi hoàn tất xét nghiệm', path: ['result_data'] });
//# sourceMappingURL=test-orders.schema.js.map