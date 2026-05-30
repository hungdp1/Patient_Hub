"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.requireRole = requireRole;
const jwt_1 = require("../utils/jwt");
const error_1 = require("./error");
function authenticate(req, _res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        throw new error_1.AppError(401, 'Thiếu hoặc sai định dạng token');
    }
    const token = header.slice('Bearer '.length).trim();
    try {
        req.user = (0, jwt_1.verifyToken)(token);
    }
    catch {
        throw new error_1.AppError(401, 'Token không hợp lệ hoặc đã hết hạn');
    }
    next();
}
function requireRole(...roles) {
    return (req, _res, next) => {
        if (!req.user) {
            throw new error_1.AppError(401, 'Chưa xác thực');
        }
        if (!roles.includes(req.user.role)) {
            throw new error_1.AppError(403, 'Không có quyền truy cập');
        }
        next();
    };
}
//# sourceMappingURL=auth.js.map