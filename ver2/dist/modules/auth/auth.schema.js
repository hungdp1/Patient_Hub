"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPasswordSchema = exports.changePasswordSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, 'Thiếu username'),
    password: zod_1.z.string().min(1, 'Thiếu mật khẩu'),
});
exports.changePasswordSchema = zod_1.z
    .object({
    oldPassword: zod_1.z.string().min(1, 'Thiếu mật khẩu cũ'),
    newPassword: zod_1.z.string().min(6, 'Mật khẩu mới tối thiểu 6 ký tự'),
})
    .refine((d) => d.oldPassword !== d.newPassword, {
    message: 'Mật khẩu mới phải khác mật khẩu cũ',
    path: ['newPassword'],
});
exports.forgotPasswordSchema = zod_1.z.object({
    phone: zod_1.z.string().min(6, 'Số điện thoại không hợp lệ'),
});
//# sourceMappingURL=auth.schema.js.map