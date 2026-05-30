"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.getMe = getMe;
exports.changePassword = changePassword;
exports.forgotPassword = forgotPassword;
const query_1 = require("../../db/query");
const error_1 = require("../../middleware/error");
const password_1 = require("../../utils/password");
const jwt_1 = require("../../utils/jwt");
const sms_1 = require("../../utils/sms");
function toPublic(u) {
    return { id: u.id, username: u.username, role: u.role };
}
// Số lần đăng nhập sai liên tiếp trước khi khóa tạm thời.
const MAX_FAILED_LOGINS = 5;
// Thời gian khóa sau khi vượt ngưỡng (phút).
const LOCK_MINUTES = 15;
async function login(input) {
    const user = await (0, query_1.queryOne)('SELECT * FROM users WHERE username = $1', [input.username]);
    // Thông báo chung để không lộ username có tồn tại hay không.
    if (!user)
        throw new error_1.AppError(401, 'Sai tài khoản hoặc mật khẩu');
    // QUAN TRỌNG: verify password TRƯỚC khi báo "tài khoản bị khóa" / "đang lock"
    // để chặn enumeration. Kẻ tấn công không phân biệt được username tồn tại hay
    // không cho đến khi nhập đúng password.
    const ok = await (0, password_1.verifyPassword)(input.password, user.password_hash);
    if (!ok) {
        // Tăng counter + lock nếu vượt ngưỡng.
        const next = user.failed_login_count + 1;
        if (next >= MAX_FAILED_LOGINS) {
            await (0, query_1.query)(`UPDATE users
            SET failed_login_count = 0,
                locked_until = NOW() + ($1 || ' minutes')::interval
          WHERE id = $2`, [String(LOCK_MINUTES), user.id]);
        }
        else {
            await (0, query_1.query)('UPDATE users SET failed_login_count = $1 WHERE id = $2', [next, user.id]);
        }
        throw new error_1.AppError(401, 'Sai tài khoản hoặc mật khẩu');
    }
    // Mật khẩu đúng — chỉ giờ mới báo trạng thái account.
    if (!user.is_active)
        throw new error_1.AppError(403, 'Tài khoản đã bị khóa');
    if (user.locked_until && user.locked_until > new Date()) {
        const mins = Math.ceil((user.locked_until.getTime() - Date.now()) / 60_000);
        throw new error_1.AppError(429, `Tài khoản tạm khóa do nhập sai nhiều lần. Thử lại sau ${mins} phút.`);
    }
    // Đăng nhập thành công — reset counter + lock.
    if (user.failed_login_count > 0 || user.locked_until) {
        await (0, query_1.query)('UPDATE users SET failed_login_count = 0, locked_until = NULL WHERE id = $1', [user.id]);
    }
    const token = (0, jwt_1.signToken)({
        sub: user.id,
        username: user.username,
        role: user.role,
    });
    return { token, user: toPublic(user) };
}
async function getMe(userId) {
    const user = await (0, query_1.queryOne)('SELECT * FROM users WHERE id = $1', [userId]);
    if (!user)
        throw new error_1.AppError(404, 'Người dùng không tồn tại');
    return toPublic(user);
}
async function changePassword(userId, input) {
    const user = await (0, query_1.queryOne)('SELECT * FROM users WHERE id = $1', [userId]);
    if (!user)
        throw new error_1.AppError(404, 'Người dùng không tồn tại');
    const ok = await (0, password_1.verifyPassword)(input.oldPassword, user.password_hash);
    if (!ok)
        throw new error_1.AppError(400, 'Mật khẩu cũ không đúng');
    const newHash = await (0, password_1.hashPassword)(input.newPassword);
    // Đổi mật khẩu thành công cũng coi như "phục hồi" — clear lock counter.
    await (0, query_1.queryOne)(`UPDATE users
        SET password_hash = $1,
            failed_login_count = 0,
            locked_until = NULL
      WHERE id = $2 RETURNING id`, [newHash, userId]);
}
// Số yêu cầu reset tối đa cho 1 SĐT trong 1 giờ — kết hợp với rate limit middleware
// theo IP để chống cả 2 hướng (1 IP attack nhiều SĐT, hoặc nhiều IP attack 1 SĐT).
const MAX_RESET_PER_PHONE_HOUR = 3;
// Quên mật khẩu — chỉ áp dụng cho bệnh nhân (username = SĐT theo nghiệp vụ).
// Để tránh leak username tồn tại hay không, luôn trả 200 dù không tìm thấy.
async function forgotPassword(input, ipAddr) {
    // Rate limit theo số điện thoại (chống spam reset 1 SĐT mục tiêu).
    const recent = await (0, query_1.queryOne)(`SELECT COUNT(*) AS n FROM password_reset_log
      WHERE phone = $1 AND created_at > NOW() - INTERVAL '1 hour'`, [input.phone]);
    if (recent && Number(recent.n) >= MAX_RESET_PER_PHONE_HOUR) {
        // Vẫn trả thành công ở controller để không leak; chỉ skip gửi.
        return;
    }
    // Ghi log trước khi tra cứu user (chống enumeration qua timing).
    await (0, query_1.query)('INSERT INTO password_reset_log (phone, ip_addr) VALUES ($1, $2)', [input.phone, ipAddr]);
    const user = await (0, query_1.queryOne)(`SELECT * FROM users WHERE username = $1 AND role = 'patient'`, [input.phone]);
    if (!user || !user.is_active)
        return;
    const newPassword = (0, password_1.generatePassword)();
    const newHash = await (0, password_1.hashPassword)(newPassword);
    await (0, query_1.queryOne)(`UPDATE users
        SET password_hash = $1,
            failed_login_count = 0,
            locked_until = NULL
      WHERE id = $2 RETURNING id`, [newHash, user.id]);
    (0, sms_1.sendSms)(input.phone, `Mật khẩu mới của bạn: ${newPassword}`);
}
//# sourceMappingURL=auth.service.js.map