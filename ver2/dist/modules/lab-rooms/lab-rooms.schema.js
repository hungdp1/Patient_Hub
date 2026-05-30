"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idParamSchema = exports.updateLabRoomSchema = exports.createLabRoomSchema = void 0;
const zod_1 = require("zod");
exports.createLabRoomSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Tên phòng không được để trống').max(100),
    test_type_id: zod_1.z.string().uuid('test_type_id không hợp lệ'),
});
exports.updateLabRoomSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    test_type_id: zod_1.z.string().uuid().optional(),
});
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('ID không hợp lệ'),
});
//# sourceMappingURL=lab-rooms.schema.js.map