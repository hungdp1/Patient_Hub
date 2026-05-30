"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePassword = generatePassword;
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const SALT_ROUNDS = 10;
// Sinh mật khẩu ngẫu nhiên gửi cho bệnh nhân qua SMS.
// Bỏ ký tự dễ nhầm (0/O, 1/l/I) cho dễ đọc khi nhận tin nhắn.
// Dùng rejection sampling thay vì modulo để tránh bias (charset 55 ký tự,
// 256 % 55 ≠ 0 → các ký tự đầu charset có xác suất cao hơn).
function generatePassword(length = 10) {
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    const max = Math.floor(256 / charset.length) * charset.length; // 252 với 55 ký tự
    let out = '';
    while (out.length < length) {
        // Lấy thêm 1 chunk byte; mỗi byte < max thì dùng, ngược lại bỏ.
        const bytes = node_crypto_1.default.randomBytes(length * 2);
        for (let i = 0; i < bytes.length && out.length < length; i++) {
            const b = bytes[i];
            if (b < max)
                out += charset[b % charset.length];
        }
    }
    return out;
}
function hashPassword(plain) {
    return bcryptjs_1.default.hash(plain, SALT_ROUNDS);
}
function verifyPassword(plain, hash) {
    return bcryptjs_1.default.compare(plain, hash);
}
//# sourceMappingURL=password.js.map