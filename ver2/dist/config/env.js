"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProd = exports.env = void 0;
require("dotenv/config");
const zod_1 = require("zod");
const schema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.coerce.number().int().positive().default(3000),
    DATABASE_URL: zod_1.z.string().min(1),
    JWT_SECRET: zod_1.z.string().min(16, 'JWT_SECRET phải >= 16 ký tự'),
    JWT_EXPIRES_IN: zod_1.z.string().default('1d'),
    AES_KEY: zod_1.z
        .string()
        .regex(/^[0-9a-fA-F]{64}$/, 'AES_KEY phải là 64 ký tự hex (32 bytes)'),
    // VNPay — bắt buộc khi bật thanh toán thật. Ở dev có thể để trống,
    // tích hợp sẽ throw khi gọi nếu thiếu config.
    VNP_TMN_CODE: zod_1.z.string().optional(),
    VNP_HASH_SECRET: zod_1.z.string().optional(),
    VNP_HOST: zod_1.z.string().default('https://sandbox.vnpayment.vn'),
    VNP_RETURN_URL: zod_1.z
        .string()
        .url()
        .default('http://localhost:3000/api/invoices/vnpay-return'),
    // Whitelist IP cho IPN — bỏ trống = tắt kiểm tra (chỉ dùng dev/test).
    // Production NÊN khai báo: 113.160.92.202,113.52.45.78 (xem docs VNPay).
    VNP_ALLOWED_IPS: zod_1.z.string().optional(),
    // PayOS — đăng ký kênh thanh toán tại https://my.payos.vn
    // Lấy 3 key trong "Kênh thanh toán" → tab "Thông tin tích hợp".
    PAYOS_CLIENT_ID: zod_1.z.string().optional(),
    PAYOS_API_KEY: zod_1.z.string().optional(),
    PAYOS_CHECKSUM_KEY: zod_1.z.string().optional(),
    PAYOS_RETURN_URL: zod_1.z
        .string()
        .url()
        .default('http://localhost:3000/api/invoices/payos-return'),
    PAYOS_CANCEL_URL: zod_1.z
        .string()
        .url()
        .default('http://localhost:3000/api/invoices/payos-cancel'),
    // Whitelist IP cho PayOS webhook — bỏ trống = tắt (dev). Production NÊN khai báo.
    PAYOS_ALLOWED_IPS: zod_1.z.string().optional(),
    // CORS allowed origins (CSV). Bỏ trống ở dev = '*'; production BẮT BUỘC khai báo.
    CORS_ORIGINS: zod_1.z.string().optional(),
    // Trust proxy hop count khi deploy sau nginx / cloudfront / cloudflare.
    // 0 = tắt (default), 1 = 1 reverse proxy, ... Quan trọng cho clientIp() đọc X-Forwarded-For.
    TRUST_PROXY: zod_1.z.coerce.number().int().min(0).max(10).default(0),
    // Phí khám mặc định (VNĐ) — quản lý có thể cấu hình.
    DEFAULT_CONSULTATION_FEE: zod_1.z.coerce.number().int().nonnegative().default(150000),
});
const parsed = schema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Biến môi trường không hợp lệ:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
}
exports.env = parsed.data;
exports.isProd = exports.env.NODE_ENV === 'production';
//# sourceMappingURL=env.js.map