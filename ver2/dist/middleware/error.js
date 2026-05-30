"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const env_1 = require("../config/env");
class AppError extends Error {
    statusCode;
    details;
    constructor(statusCode, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
function notFoundHandler(req, res) {
    res.status(404).json({ error: 'Không tìm thấy route', path: req.path });
}
// Express 5 tự forward lỗi async (promise reject) vào đây.
function errorHandler(err, _req, res, _next) {
    if (err instanceof zod_1.ZodError) {
        res.status(400).json({
            error: 'Dữ liệu không hợp lệ',
            details: err.flatten(),
        });
        return;
    }
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            error: err.message,
            ...(err.details ? { details: err.details } : {}),
        });
        return;
    }
    // CORS rejection — cors package throw plain Error; trả 403 sạch hơn 500.
    if (err instanceof Error && err.message === 'Origin không được phép') {
        res.status(403).json({ error: err.message });
        return;
    }
    console.error('❌ Unhandled error:', err);
    res.status(500).json({
        error: 'Lỗi máy chủ nội bộ',
        ...(env_1.isProd ? {} : { detail: String(err) }),
    });
}
//# sourceMappingURL=error.js.map