"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastSchema = exports.listQuerySchema = exports.idParamSchema = void 0;
const zod_1 = require("zod");
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('ID không hợp lệ'),
});
exports.listQuerySchema = zod_1.z.object({
    is_read: zod_1.z
        .union([zod_1.z.literal('true'), zod_1.z.literal('false')])
        .optional()
        .transform((v) => (v === undefined ? undefined : v === 'true')),
    limit: zod_1.z.coerce.number().int().min(1).max(200).default(50),
});
exports.broadcastSchema = zod_1.z
    .object({
    title: zod_1.z.string().min(1, 'Tiêu đề bắt buộc').max(255),
    body: zod_1.z.string().min(1, 'Nội dung bắt buộc').max(2000),
    target_scope: zod_1.z.enum([
        'single',
        'all_doctors',
        'all_patients',
        'all_system',
    ]),
    recipient_user_id: zod_1.z.string().uuid().optional(),
})
    .refine((d) => d.target_scope !== 'single' || !!d.recipient_user_id, { message: 'target_scope=single yêu cầu recipient_user_id', path: ['recipient_user_id'] });
//# sourceMappingURL=notifications.schema.js.map