"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = query;
exports.queryOne = queryOne;
exports.withTransaction = withTransaction;
const pool_1 = require("./pool");
// Luôn dùng tham số hóa ($1, $2...) — KHÔNG nội suy chuỗi vào SQL (chống SQL injection).
async function query(text, params) {
    const res = await pool_1.pool.query(text, params);
    return res.rows;
}
async function queryOne(text, params) {
    const rows = await query(text, params);
    return rows[0] ?? null;
}
// Chạy nhiều câu lệnh trong 1 transaction. Tự rollback nếu callback throw.
async function withTransaction(fn) {
    const client = await pool_1.pool.connect();
    try {
        await client.query('BEGIN');
        const result = await fn(client);
        await client.query('COMMIT');
        return result;
    }
    catch (err) {
        await client.query('ROLLBACK');
        throw err;
    }
    finally {
        client.release();
    }
}
//# sourceMappingURL=query.js.map