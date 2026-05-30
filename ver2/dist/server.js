"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const pool_1 = require("./db/pool");
const scheduler_1 = require("./scheduler");
async function start() {
    // Kiểm tra kết nối DB trước khi mở cổng — fail fast.
    await pool_1.pool.query('SELECT 1');
    console.log('✓ Kết nối PostgreSQL OK');
    const app = (0, app_1.createApp)();
    const server = app.listen(env_1.env.PORT, () => {
        console.log(`✓ Server chạy tại http://localhost:${env_1.env.PORT}/api`);
    });
    (0, scheduler_1.startSchedulers)();
    console.log('✓ Đã bật cron kiểm tra lịch hẹn quá hạn (mỗi 1h)');
    const shutdown = (signal) => {
        console.log(`\n${signal} — đang tắt server...`);
        (0, scheduler_1.stopSchedulers)();
        server.close(() => {
            void (0, pool_1.closePool)().then(() => process.exit(0));
        });
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
}
start().catch((err) => {
    console.error('❌ Không khởi động được server:', err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map