"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = sendMessage;
exports.listConversations = listConversations;
exports.getHistory = getHistory;
const query_1 = require("../../db/query");
const error_1 = require("../../middleware/error");
const CHAT_ROLES = ['doctor', 'technician', 'manager'];
function ensureChatRole(role) {
    if (!CHAT_ROLES.includes(role))
        throw new error_1.AppError(403, 'Role này không có chức năng chat');
}
async function sendMessage(input, actor) {
    ensureChatRole(actor.role);
    if (input.receiver_user_id === actor.sub)
        throw new error_1.AppError(400, 'Không thể gửi cho chính mình');
    const peer = await (0, query_1.queryOne)('SELECT role, is_active FROM users WHERE id = $1', [input.receiver_user_id]);
    if (!peer)
        throw new error_1.AppError(404, 'Người nhận không tồn tại');
    if (!peer.is_active)
        throw new error_1.AppError(409, 'Người nhận đã bị khóa');
    if (!CHAT_ROLES.includes(peer.role))
        throw new error_1.AppError(400, 'Người nhận không thuộc nhóm có chat');
    const row = await (0, query_1.queryOne)(`INSERT INTO chat_messages (sender_user_id, receiver_user_id, content)
     VALUES ($1, $2, $3) RETURNING *`, [actor.sub, input.receiver_user_id, input.content]);
    return row;
}
// Danh sách hội thoại: nhóm theo peer, lấy tin cuối + số tin chưa đọc thật.
async function listConversations(actor) {
    ensureChatRole(actor.role);
    return (0, query_1.query)(`WITH pairs AS (
       SELECT
         CASE WHEN sender_user_id = $1 THEN receiver_user_id ELSE sender_user_id END AS peer_user_id,
         content, sent_at,
         ROW_NUMBER() OVER (
           PARTITION BY CASE WHEN sender_user_id = $1 THEN receiver_user_id ELSE sender_user_id END
           ORDER BY sent_at DESC
         ) AS rn
       FROM chat_messages
       WHERE sender_user_id = $1 OR receiver_user_id = $1
     ),
     unread AS (
       SELECT sender_user_id AS peer_user_id, COUNT(*) AS n
         FROM chat_messages
        WHERE receiver_user_id = $1 AND read_at IS NULL
        GROUP BY sender_user_id
     )
     SELECT p.peer_user_id,
            COALESCE(d.full_name, t.full_name, u.username) AS peer_name,
            u.role AS peer_role,
            p.content AS last_message,
            p.sent_at AS last_sent_at,
            COALESCE(ur.n, 0)::int AS unread_count
       FROM pairs p
       JOIN users u ON u.id = p.peer_user_id
       LEFT JOIN doctors d ON d.user_id = p.peer_user_id
       LEFT JOIN technicians t ON t.user_id = p.peer_user_id
       LEFT JOIN unread ur ON ur.peer_user_id = p.peer_user_id
      WHERE p.rn = 1
      ORDER BY p.sent_at DESC`, [actor.sub]);
}
async function getHistory(peerId, q, actor) {
    ensureChatRole(actor.role);
    if (peerId === actor.sub)
        throw new error_1.AppError(400, 'Không có hội thoại với chính mình');
    // Kiểm tra peer cũng thuộc role được chat (đối xứng với sendMessage).
    const peer = await (0, query_1.queryOne)('SELECT role FROM users WHERE id = $1', [peerId]);
    if (!peer)
        throw new error_1.AppError(404, 'Người nhận không tồn tại');
    if (!CHAT_ROLES.includes(peer.role))
        throw new error_1.AppError(400, 'Người nhận không thuộc nhóm có chat');
    const params = [actor.sub, peerId];
    let sql = `SELECT * FROM chat_messages
              WHERE (sender_user_id = $1 AND receiver_user_id = $2)
                 OR (sender_user_id = $2 AND receiver_user_id = $1)`;
    if (q.before) {
        params.push(q.before);
        sql += ` AND sent_at < $${params.length}`;
    }
    params.push(q.limit);
    sql += ` ORDER BY sent_at DESC LIMIT $${params.length}`;
    const rows = await (0, query_1.query)(sql, params);
    // Mark messages from peer as read khi user mở conversation — UX chuẩn chat app.
    await (0, query_1.query)(`UPDATE chat_messages SET read_at = NOW()
      WHERE sender_user_id = $1 AND receiver_user_id = $2 AND read_at IS NULL`, [peerId, actor.sub]);
    return rows.reverse(); // trả về thứ tự tăng dần thời gian để client hiển thị
}
//# sourceMappingURL=chat.service.js.map