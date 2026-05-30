"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.historyQuerySchema = exports.peerParamSchema = exports.sendMessageSchema = void 0;
const zod_1 = require("zod");
exports.sendMessageSchema = zod_1.z.object({
    receiver_user_id: zod_1.z.string().uuid('receiver_user_id không hợp lệ'),
    content: zod_1.z.string().min(1, 'Nội dung không được rỗng').max(2000),
});
exports.peerParamSchema = zod_1.z.object({
    peerId: zod_1.z.string().uuid('peerId không hợp lệ'),
});
exports.historyQuerySchema = zod_1.z.object({
    before: zod_1.z.string().datetime().optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(200).default(50),
});
//# sourceMappingURL=chat.schema.js.map