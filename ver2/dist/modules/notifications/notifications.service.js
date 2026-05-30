"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMine = listMine;
exports.countUnread = countUnread;
exports.markRead = markRead;
exports.markAllRead = markAllRead;
exports.broadcast = broadcast;
const query_1 = require("../../db/query");
const error_1 = require("../../middleware/error");
// Role không có phần thông báo (theo spec): receptionist, cashier.
function ensureCanReceive(role) {
    if (role === 'receptionist' || role === 'cashier')
        throw new error_1.AppError(403, 'Role này không có chức năng thông báo');
}
function scopesForRole(role) {
    const scopes = ['single', 'all_system'];
    if (role === 'doctor')
        scopes.push('all_doctors');
    if (role === 'patient')
        scopes.push('all_patients');
    return scopes;
}
async function listMine(q, actor) {
    ensureCanReceive(actor.role);
    const scopes = scopesForRole(actor.role);
    const params = [actor.sub, scopes];
    let sql = `
    SELECT n.*,
           CASE
             WHEN n.recipient_user_id IS NOT NULL THEN n.is_read
             ELSE EXISTS (
               SELECT 1 FROM notification_reads nr
                WHERE nr.notification_id = n.id AND nr.user_id = $1
             )
           END AS read_by_me
      FROM notifications n
     WHERE (n.recipient_user_id = $1
        OR (n.recipient_user_id IS NULL AND n.target_scope = ANY($2)))
  `;
    if (q.is_read !== undefined) {
        params.push(q.is_read);
        sql += ` AND (
      CASE
        WHEN n.recipient_user_id IS NOT NULL THEN n.is_read
        ELSE EXISTS (
          SELECT 1 FROM notification_reads nr
           WHERE nr.notification_id = n.id AND nr.user_id = $1
        )
      END
    ) = $${params.length}`;
    }
    params.push(q.limit);
    sql += ` ORDER BY n.created_at DESC LIMIT $${params.length}`;
    return (0, query_1.query)(sql, params);
}
async function countUnread(actor) {
    ensureCanReceive(actor.role);
    const scopes = scopesForRole(actor.role);
    const row = await (0, query_1.queryOne)(`SELECT COUNT(*) AS n FROM notifications n
      WHERE (
        (n.recipient_user_id = $1 AND n.is_read = FALSE)
        OR (n.recipient_user_id IS NULL AND n.target_scope = ANY($2)
            AND NOT EXISTS (
              SELECT 1 FROM notification_reads nr
               WHERE nr.notification_id = n.id AND nr.user_id = $1
            ))
      )`, [actor.sub, scopes]);
    return Number(row?.n ?? 0);
}
async function markRead(id, actor) {
    ensureCanReceive(actor.role);
    const n = await (0, query_1.queryOne)('SELECT * FROM notifications WHERE id = $1', [id]);
    if (!n)
        throw new error_1.AppError(404, 'Thông báo không tồn tại');
    if (n.recipient_user_id) {
        if (n.recipient_user_id !== actor.sub)
            throw new error_1.AppError(403, 'Không phải thông báo của bạn');
        await (0, query_1.query)('UPDATE notifications SET is_read = TRUE WHERE id = $1', [id]);
    }
    else {
        // Broadcast — kiểm tra user thuộc scope đó.
        if (!scopesForRole(actor.role).includes(n.target_scope)) {
            throw new error_1.AppError(403, 'Không thuộc phạm vi thông báo');
        }
        // Per-user read tracking; idempotent qua ON CONFLICT.
        await (0, query_1.query)(`INSERT INTO notification_reads (notification_id, user_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`, [id, actor.sub]);
    }
    return { id, read_by_me: true };
}
async function markAllRead(actor) {
    ensureCanReceive(actor.role);
    const scopes = scopesForRole(actor.role);
    let count = 0;
    await (0, query_1.withTransaction)(async (client) => {
        // 1) Mark đã đọc các single notification gửi riêng cho user.
        const singleRes = await client.query(`UPDATE notifications SET is_read = TRUE
        WHERE recipient_user_id = $1 AND is_read = FALSE
        RETURNING id`, [actor.sub]);
        count += singleRes.rowCount ?? 0;
        // 2) Insert read marker cho mọi broadcast user chưa đọc.
        const bcRes = await client.query(`INSERT INTO notification_reads (notification_id, user_id)
       SELECT n.id, $1
         FROM notifications n
        WHERE n.recipient_user_id IS NULL
          AND n.target_scope = ANY($2)
          AND NOT EXISTS (
            SELECT 1 FROM notification_reads nr
             WHERE nr.notification_id = n.id AND nr.user_id = $1
          )
       RETURNING notification_id AS id`, [actor.sub, scopes]);
        count += bcRes.rowCount ?? 0;
    });
    return count;
}
async function broadcast(input, actor) {
    if (actor.role !== 'manager')
        throw new error_1.AppError(403, 'Chỉ quản lý gửi thông báo hàng loạt');
    if (input.target_scope === 'single') {
        const user = await (0, query_1.queryOne)('SELECT role FROM users WHERE id = $1', [input.recipient_user_id]);
        if (!user)
            throw new error_1.AppError(404, 'Người nhận không tồn tại');
        // Không gửi cho role không nhận được thông báo — tránh tạo notif "ma".
        if (user.role === 'cashier' || user.role === 'receptionist') {
            throw new error_1.AppError(400, 'Người nhận không có chức năng nhận thông báo');
        }
        await (0, query_1.query)(`INSERT INTO notifications (recipient_user_id, title, body, target_scope)
       VALUES ($1, $2, $3, 'single')`, [input.recipient_user_id, input.title, input.body]);
        return { inserted: 1 };
    }
    await (0, query_1.query)(`INSERT INTO notifications (recipient_user_id, title, body, target_scope)
     VALUES (NULL, $1, $2, $3)`, [input.title, input.body, input.target_scope]);
    return { inserted: 1 };
}
//# sourceMappingURL=notifications.service.js.map