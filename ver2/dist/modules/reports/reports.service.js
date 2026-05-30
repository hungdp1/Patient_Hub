"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReport = createReport;
exports.listReports = listReports;
exports.getReport = getReport;
exports.resolveReport = resolveReport;
const query_1 = require("../../db/query");
const error_1 = require("../../middleware/error");
const notification_helper_1 = require("../notifications/notification.helper");
// Theo spec: tiếp tân và thu ngân không có chức năng báo cáo / thông báo.
function ensureCanReport(role) {
    if (role === 'receptionist' || role === 'cashier')
        throw new error_1.AppError(403, 'Role này không được gửi báo cáo');
}
async function createReport(input, actor) {
    ensureCanReport(actor.role);
    const row = await (0, query_1.queryOne)(`INSERT INTO reports (reporter_user_id, content)
     VALUES ($1, $2) RETURNING *`, [actor.sub, input.content]);
    return row;
}
async function listReports(q, actor) {
    const params = [];
    const where = [];
    if (actor.role === 'manager') {
        // Manager xem tất cả.
    }
    else {
        ensureCanReport(actor.role);
        params.push(actor.sub);
        where.push(`reporter_user_id = $${params.length}`);
    }
    if (q.status) {
        params.push(q.status);
        where.push(`status = $${params.length}`);
    }
    params.push(q.limit);
    const sql = `SELECT * FROM reports
               ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
               ORDER BY created_at DESC LIMIT $${params.length}`;
    return (0, query_1.query)(sql, params);
}
async function getReport(id, actor) {
    const r = await (0, query_1.queryOne)('SELECT * FROM reports WHERE id = $1', [id]);
    if (!r)
        throw new error_1.AppError(404, 'Báo cáo không tồn tại');
    if (actor.role !== 'manager' && r.reporter_user_id !== actor.sub)
        throw new error_1.AppError(403, 'Không có quyền');
    return r;
}
async function resolveReport(id, actor) {
    if (actor.role !== 'manager')
        throw new error_1.AppError(403, 'Chỉ quản lý giải quyết báo cáo');
    const existing = await (0, query_1.queryOne)('SELECT * FROM reports WHERE id = $1', [id]);
    if (!existing)
        throw new error_1.AppError(404, 'Báo cáo không tồn tại');
    if (existing.status === 'resolved')
        throw new error_1.AppError(409, 'Báo cáo đã được giải quyết');
    const updated = await (0, query_1.queryOne)(`UPDATE reports SET status = 'resolved', resolved_at = NOW()
      WHERE id = $1 RETURNING *`, [id]);
    // Thông báo cho người gửi báo cáo.
    await (0, notification_helper_1.notifyUser)(existing.reporter_user_id, 'Báo cáo đã được xử lý', 'Quản lý đã giải quyết báo cáo của bạn.');
    return updated;
}
//# sourceMappingURL=reports.service.js.map