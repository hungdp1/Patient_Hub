"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.closePool = closePool;
const pg_1 = require("pg");
const env_1 = require("../config/env");
// DATE (oid 1082): trả về chuỗi 'YYYY-MM-DD' thay vì Date —
// tránh lệch ngày do timezone (bug kinh điển của node-postgres).
pg_1.types.setTypeParser(1082, (val) => val);
// NUMERIC (oid 1700) giữ mặc định = string để không mất precision tiền tệ.
exports.pool = new pg_1.Pool({
    connectionString: env_1.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
});
exports.pool.on('error', (err) => {
    console.error('❌ Lỗi pg pool (idle client):', err);
});
async function closePool() {
    await exports.pool.end();
}
//# sourceMappingURL=pool.js.map