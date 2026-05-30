"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboard = getDashboard;
const query_1 = require("../../db/query");
const error_1 = require("../../middleware/error");
async function getDashboard(q, actor) {
    if (actor.role !== 'manager')
        throw new error_1.AppError(403, 'Chỉ quản lý xem dashboard');
    const now = new Date();
    const year = q.year ?? now.getUTCFullYear();
    const month = q.month;
    const users = await (0, query_1.queryOne)(`SELECT
        COUNT(*) FILTER (WHERE role='patient') AS patients,
        COUNT(*) FILTER (WHERE role='doctor') AS doctors,
        COUNT(*) FILTER (WHERE role='technician') AS technicians,
        COUNT(*) FILTER (WHERE role='cashier') AS cashiers,
        COUNT(*) FILTER (WHERE role='receptionist') AS receptionists,
        COUNT(*) FILTER (WHERE is_active = FALSE) AS inactive
       FROM users`);
    const appts = await (0, query_1.queryOne)(`SELECT
        COUNT(*) FILTER (WHERE status IN ('pending','confirmed')) AS pending,
        COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress,
        COUNT(*) FILTER (
          WHERE status = 'done' AND DATE(updated_at) = CURRENT_DATE
        ) AS done_today
       FROM appointments`);
    const tests = await (0, query_1.queryOne)(`SELECT
        COUNT(*) FILTER (WHERE status = 'waiting') AS waiting,
        COUNT(*) FILTER (WHERE status = 'processing') AS processing,
        COUNT(*) FILTER (
          WHERE status = 'completed' AND DATE(updated_at) = CURRENT_DATE
        ) AS completed_today
       FROM test_order_items`);
    const reports = await (0, query_1.queryOne)(`SELECT COUNT(*) AS n FROM reports WHERE status = 'pending'`);
    const params = [year];
    let dateFilter = `EXTRACT(YEAR FROM paid_at) = $1`;
    if (month) {
        params.push(month);
        dateFilter += ` AND EXTRACT(MONTH FROM paid_at) = $2`;
    }
    const rev = await (0, query_1.queryOne)(`SELECT COALESCE(SUM(final_amount), 0)::text AS total, COUNT(*) AS count
       FROM invoices
      WHERE payment_method = 'vnpay'
        AND payment_status = 'paid'
        AND ${dateFilter}`, params);
    return {
        users: {
            patients: Number(users?.patients ?? 0),
            doctors: Number(users?.doctors ?? 0),
            technicians: Number(users?.technicians ?? 0),
            cashiers: Number(users?.cashiers ?? 0),
            receptionists: Number(users?.receptionists ?? 0),
            inactive: Number(users?.inactive ?? 0),
        },
        appointments: {
            pending: Number(appts?.pending ?? 0),
            in_progress: Number(appts?.in_progress ?? 0),
            done_today: Number(appts?.done_today ?? 0),
        },
        test_orders: {
            waiting: Number(tests?.waiting ?? 0),
            processing: Number(tests?.processing ?? 0),
            completed_today: Number(tests?.completed_today ?? 0),
        },
        reports_open: Number(reports?.n ?? 0),
        revenue_vnpay: {
            year,
            ...(month ? { month } : {}),
            total: rev?.total ?? '0',
            count: Number(rev?.count ?? 0),
        },
    };
}
//# sourceMappingURL=manager.service.js.map