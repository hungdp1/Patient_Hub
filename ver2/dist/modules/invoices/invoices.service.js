"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInvoice = generateInvoice;
exports.payVnpay = payVnpay;
exports.payPayos = payPayos;
exports.handlePayosWebhook = handlePayosWebhook;
exports.handleVnpayReturn = handleVnpayReturn;
exports.handleVnpayIpn = handleVnpayIpn;
exports.payCash = payCash;
exports.getInvoice = getInvoice;
exports.listInvoices = listInvoices;
exports.getRevenue = getRevenue;
const query_1 = require("../../db/query");
const error_1 = require("../../middleware/error");
const env_1 = require("../../config/env");
const vnpay_1 = require("../../integrations/vnpay");
const payos_1 = require("../../integrations/payos");
const notification_helper_1 = require("../notifications/notification.helper");
async function patientIdOfUser(userId) {
    const row = await (0, query_1.queryOne)('SELECT id FROM patients WHERE user_id = $1', [userId]);
    if (!row)
        throw new error_1.AppError(404, 'Không tìm thấy hồ sơ bệnh nhân');
    return row.id;
}
async function loadDetail(id) {
    const inv = await (0, query_1.queryOne)('SELECT * FROM invoices WHERE id = $1', [id]);
    if (!inv)
        throw new error_1.AppError(404, 'Hóa đơn không tồn tại');
    const items = await (0, query_1.query)('SELECT * FROM invoice_items WHERE invoice_id = $1', [id]);
    return { ...inv, items };
}
// Quy đổi tiền theo BHYT: nếu insurance_expiry còn hạn → dùng insurance_price.
function applyInsurance(unit, insurance, hasValidInsurance) {
    return { discounted: hasValidInsurance ? insurance : unit };
}
async function logWebhookFailure(provider, payload, errorMsg) {
    try {
        await (0, query_1.query)(`INSERT INTO webhook_failures (provider, payload, error_msg)
       VALUES ($1, $2::jsonb, $3)`, [provider, JSON.stringify(payload ?? null), errorMsg]);
    }
    catch (err) {
        console.error('❌ Không ghi được webhook_failures:', err);
    }
}
// Sinh hóa đơn nháp (pending). Điều kiện: session finalized + tất cả XN completed.
// Hóa đơn = phí khám (snapshot) + tổng các xét nghiệm đã hoàn tất.
// (Thuốc theo prescription_items hiện chưa có giá riêng — dùng lib_medicines.price,
//  nhưng schema invoice_items chưa có service_type='medicine'. Để giảm rủi ro
//  thay đổi nghiệp vụ, hiện chỉ thêm consultation_fee. Thuốc bổ sung ở bước sau
//  khi schema mở rộng.)
async function generateInvoice(input, actor) {
    if (!['cashier', 'patient'].includes(actor.role))
        throw new error_1.AppError(403, 'Chỉ thu ngân hoặc bệnh nhân được sinh hóa đơn');
    const session = await (0, query_1.queryOne)('SELECT * FROM examination_sessions WHERE id = $1', [input.session_id]);
    if (!session)
        throw new error_1.AppError(404, 'Đợt khám không tồn tại');
    if (!session.is_finalized)
        throw new error_1.AppError(409, 'Đợt khám chưa được bác sĩ chốt');
    // Patient chỉ được sinh hóa đơn của chính mình.
    if (actor.role === 'patient') {
        const pid = await patientIdOfUser(actor.sub);
        if (session.patient_id !== pid)
            throw new error_1.AppError(403, 'Không phải đợt khám của bạn');
    }
    // Không cho tạo trùng — đã có invoice cho session này.
    const exist = await (0, query_1.queryOne)('SELECT * FROM invoices WHERE session_id = $1', [input.session_id]);
    if (exist)
        return loadDetail(exist.id);
    // Tất cả XN phải completed.
    const pending = await (0, query_1.queryOne)(`SELECT COUNT(*) AS n
       FROM test_order_items toi
       JOIN test_orders t ON t.id = toi.test_order_id
      WHERE t.session_id = $1 AND toi.status <> 'completed'`, [input.session_id]);
    if (pending && Number(pending.n) > 0)
        throw new error_1.AppError(409, 'Còn xét nghiệm chưa hoàn tất — chưa thể thanh toán');
    const patient = await (0, query_1.queryOne)('SELECT * FROM patients WHERE id = $1', [session.patient_id]);
    if (!patient)
        throw new error_1.AppError(404, 'Bệnh nhân không tồn tại');
    const today = new Date().toISOString().slice(0, 10);
    const hasInsurance = !!patient.insurance_number_encrypted &&
        !!patient.insurance_expiry &&
        patient.insurance_expiry >= today;
    // Lấy danh sách dịch vụ: phí khám + n xét nghiệm.
    const consultationFee = env_1.env.DEFAULT_CONSULTATION_FEE;
    const testRows = await (0, query_1.query)(`SELECT toi.id AS item_id, lt.id AS test_type_id, lt.name AS test_name,
            lt.price, lt.insurance_price
       FROM test_order_items toi
       JOIN test_orders t ON t.id = toi.test_order_id
       JOIN lib_test_types lt ON lt.id = toi.test_type_id
      WHERE t.session_id = $1 AND toi.status = 'completed'`, [input.session_id]);
    // Phí khám luôn tính. BHYT không áp dụng cho phí khám trong v1.
    let total = consultationFee;
    let discount = 0;
    const itemsToInsert = [
        {
            service_type: 'consultation',
            test_order_item_id: null,
            service_label: 'Phí khám bệnh',
            unit_price: consultationFee.toFixed(2),
            discounted_price: consultationFee.toFixed(2),
            quantity: 1,
            subtotal: consultationFee.toFixed(2),
        },
    ];
    for (const r of testRows) {
        const { discounted } = applyInsurance(r.price, r.insurance_price, hasInsurance);
        const unit = Number(r.price);
        const disc = Number(discounted);
        total += unit;
        discount += unit - disc;
        itemsToInsert.push({
            service_type: 'test',
            test_order_item_id: r.item_id,
            service_label: r.test_name,
            unit_price: r.price,
            discounted_price: discounted,
            quantity: 1,
            subtotal: discounted,
        });
    }
    const final = total - discount;
    let created;
    try {
        created = await (0, query_1.withTransaction)(async (client) => {
            const inv = await client.query(`INSERT INTO invoices
           (patient_id, session_id, total_amount, insurance_discount, final_amount,
            consultation_fee, payment_status)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *`, [
                session.patient_id,
                input.session_id,
                total.toFixed(2),
                discount.toFixed(2),
                final.toFixed(2),
                consultationFee.toFixed(2),
            ]);
            const invoiceId = inv.rows[0].id;
            for (const it of itemsToInsert) {
                await client.query(`INSERT INTO invoice_items
             (invoice_id, service_type, test_order_item_id, service_label,
              unit_price, discounted_price, quantity, subtotal)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, [
                    invoiceId,
                    it.service_type,
                    it.test_order_item_id,
                    it.service_label,
                    it.unit_price,
                    it.discounted_price,
                    it.quantity,
                    it.subtotal,
                ]);
            }
            return inv.rows[0];
        });
    }
    catch (err) {
        // Race condition: 2 request đồng thời cùng pass check `exist` → cùng INSERT.
        // invoices.session_id là UNIQUE → 1 ăn, 1 throw 23505. Convert sang trả về
        // invoice đã tạo (idempotent giống nhánh `if (exist)` ở trên).
        if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
            const existing = await (0, query_1.queryOne)('SELECT * FROM invoices WHERE session_id = $1', [input.session_id]);
            if (existing)
                return loadDetail(existing.id);
        }
        throw err;
    }
    return loadDetail(created.id);
}
// Bệnh nhân khởi tạo phiên thanh toán VNPay. Trả URL cho client redirect.
// LƯU Ý: hóa đơn KHÔNG được đánh dấu paid ở đây — chỉ ghi vnp_txn_ref + đặt
// payment_method='vnpay'. Trạng thái 'paid' chỉ được set ở handleVnpayIpn().
async function payVnpay(id, actor, ipAddr, bankCode) {
    if (actor.role !== 'patient')
        throw new error_1.AppError(403, 'Chỉ bệnh nhân thanh toán online');
    const inv = await (0, query_1.queryOne)('SELECT * FROM invoices WHERE id = $1', [id]);
    if (!inv)
        throw new error_1.AppError(404, 'Hóa đơn không tồn tại');
    const pid = await patientIdOfUser(actor.sub);
    if (inv.patient_id !== pid)
        throw new error_1.AppError(403, 'Không phải hóa đơn của bạn');
    if (inv.payment_status === 'paid')
        throw new error_1.AppError(409, 'Hóa đơn đã thanh toán');
    // Sinh TxnRef mới mỗi lần bệnh nhân bấm thanh toán (cho phép retry).
    const txnRef = (0, vnpay_1.generateTxnRef)();
    const amount = Math.round(Number(inv.final_amount));
    if (!Number.isFinite(amount) || amount < 1)
        throw new error_1.AppError(400, 'Số tiền hóa đơn không hợp lệ');
    // UPDATE DB TRƯỚC build URL — nếu DB fail, không trả URL cho user.
    // Ngược lại sẽ có URL hợp lệ trên client mà IPN không tìm thấy txnRef trong DB
    // → user thanh toán xong nhưng hệ thống không cập nhật được.
    await (0, query_1.query)(`UPDATE invoices
        SET payment_method = 'vnpay',
            vnp_txn_ref = $2
      WHERE id = $1`, [id, txnRef]);
    const vnp_url = (0, vnpay_1.buildPaymentUrl)({
        amount,
        txnRef,
        orderInfo: `Thanh toan hoa don ${id}`,
        ipAddr,
        ...(bankCode ? { bankCode } : {}),
    });
    return { invoice: await loadDetail(id), vnp_url };
}
// ─── PayOS ────────────────────────────────────────────────────────────────
async function payPayos(id, actor) {
    if (actor.role !== 'patient')
        throw new error_1.AppError(403, 'Chỉ bệnh nhân thanh toán online');
    const inv = await (0, query_1.queryOne)('SELECT * FROM invoices WHERE id = $1', [id]);
    if (!inv)
        throw new error_1.AppError(404, 'Hóa đơn không tồn tại');
    const pid = await patientIdOfUser(actor.sub);
    if (inv.patient_id !== pid)
        throw new error_1.AppError(403, 'Không phải hóa đơn của bạn');
    if (inv.payment_status === 'paid')
        throw new error_1.AppError(409, 'Hóa đơn đã thanh toán');
    const amount = Math.round(Number(inv.final_amount));
    if (!Number.isFinite(amount) || amount < 1)
        throw new error_1.AppError(400, 'Số tiền hóa đơn không hợp lệ');
    if (inv.payos_order_code) {
        try {
            await (0, payos_1.cancelPaymentLink)(Number(inv.payos_order_code), 'Người dùng tạo link mới');
        }
        catch {
            // Bỏ qua: link cũ có thể đã hết hạn hoặc đã hủy.
        }
    }
    // Sinh orderCode + retry nếu rủi ro trùng (rất hiếm nhưng có thể).
    let orderCode = (0, payos_1.generateOrderCode)();
    for (let i = 0; i < 3; i++) {
        const dup = await (0, query_1.queryOne)('SELECT id FROM invoices WHERE payos_order_code = $1', [orderCode]);
        if (!dup)
            break;
        orderCode = (0, payos_1.generateOrderCode)();
    }
    const description = `HD ${id.slice(-6).toUpperCase()}`;
    const patient = await (0, query_1.queryOne)('SELECT full_name, phone_encrypted FROM patients WHERE id = $1', [inv.patient_id]);
    const result = await (0, payos_1.createPaymentLink)({
        orderCode,
        amount,
        description,
        ...(patient?.full_name ? { buyerName: patient.full_name } : {}),
    });
    await (0, query_1.withTransaction)(async (client) => {
        await client.query(`UPDATE invoices
          SET payment_method = 'payos',
              payos_order_code = $2,
              payos_payment_link_id = $3,
              payos_account_number = $4,
              payos_qr_code = $5
        WHERE id = $1`, [
            id,
            orderCode,
            result.paymentLinkId,
            result.accountNumber,
            result.qrCode,
        ]);
    });
    return { invoice: await loadDetail(id), payos: result };
}
async function handlePayosWebhook(body) {
    let data;
    try {
        data = await (0, payos_1.verifyWebhook)(body);
    }
    catch (err) {
        await logWebhookFailure('payos', body, `signature invalid: ${String(err)}`);
        return { error: 1, message: 'Invalid signature' };
    }
    if (data.orderCode === 123) {
        return { error: 0, message: 'Webhook test acknowledged' };
    }
    const inv = await (0, query_1.queryOne)('SELECT * FROM invoices WHERE payos_order_code = $1', [data.orderCode]);
    if (!inv) {
        return { error: 0, message: 'Order not found (already cleaned up)' };
    }
    if (inv.payment_status === 'paid') {
        return { error: 0, message: 'Already paid' };
    }
    const expected = Math.round(Number(inv.final_amount));
    if (data.amount !== expected) {
        await logWebhookFailure('payos', body, `amount mismatch: got ${data.amount}, expected ${expected}`);
        return { error: 1, message: 'Amount mismatch' };
    }
    if (body.code === '00' && body.success === true) {
        // Atomic update: chỉ chuyển sang 'paid' nếu hiện đang 'pending'.
        // Nếu webhook trùng đến đồng thời, chỉ có 1 row được update → 1 notification.
        const updated = await (0, query_1.queryOne)(`UPDATE invoices
          SET payment_status = 'paid',
              paid_at = NOW(),
              payos_reference = $2,
              payos_transaction_time = $3
        WHERE id = $1 AND payment_status = 'pending' RETURNING *`, [inv.id, data.reference, data.transactionDateTime]);
        if (updated) {
            const p = await (0, query_1.queryOne)('SELECT user_id FROM patients WHERE id = $1', [inv.patient_id]);
            if (p)
                await (0, notification_helper_1.notifyUser)(p.user_id, 'Thanh toán PayOS thành công', `Hóa đơn ${inv.id} đã được thanh toán ${expected.toLocaleString('vi-VN')}đ qua PayOS (REF: ${data.reference}).`);
        }
    }
    return { error: 0, message: 'OK' };
}
async function handleVnpayReturn(query) {
    const verified = (0, vnpay_1.verifyReturnUrl)(query);
    let invoice = null;
    if (verified.txnRef) {
        const row = await (0, query_1.queryOne)('SELECT * FROM invoices WHERE vnp_txn_ref = $1', [verified.txnRef]);
        if (row)
            invoice = await loadDetail(row.id);
    }
    return { verified, invoice };
}
async function handleVnpayIpn(vnpQuery) {
    const verified = (0, vnpay_1.verifyIpnCall)(vnpQuery);
    if (!verified.isVerified) {
        await logWebhookFailure('vnpay', vnpQuery, 'signature invalid');
        return vnpay_1.VnpIpn.FailChecksum;
    }
    if (!verified.txnRef)
        return vnpay_1.VnpIpn.OrderNotFound;
    const inv = await (0, query_1.queryOne)('SELECT * FROM invoices WHERE vnp_txn_ref = $1', [verified.txnRef]);
    if (!inv)
        return vnpay_1.VnpIpn.OrderNotFound;
    const expected = Math.round(Number(inv.final_amount));
    if (verified.amountVnd !== expected) {
        await logWebhookFailure('vnpay', vnpQuery, `amount mismatch: got ${verified.amountVnd}, expected ${expected}`);
        return vnpay_1.VnpIpn.InvalidAmount;
    }
    if (inv.payment_status === 'paid') {
        return vnpay_1.VnpIpn.Success;
    }
    try {
        if (verified.isSuccess && verified.responseCode === '00') {
            // Atomic: chỉ row đang 'pending' mới được chuyển sang 'paid' — chống
            // race condition khi VNPay retry IPN.
            const updated = await (0, query_1.queryOne)(`UPDATE invoices
            SET payment_status = 'paid',
                paid_at = NOW(),
                vnp_transaction_no = $2,
                vnp_response_code = $3,
                vnp_bank_code = $4,
                vnp_pay_date = $5
          WHERE id = $1 AND payment_status = 'pending' RETURNING *`, [
                inv.id,
                verified.transactionNo ?? null,
                verified.responseCode ?? null,
                verified.bankCode ?? null,
                verified.payDate ?? null,
            ]);
            if (updated) {
                const patient = await (0, query_1.queryOne)('SELECT user_id FROM patients WHERE id = $1', [inv.patient_id]);
                if (patient)
                    await (0, notification_helper_1.notifyUser)(patient.user_id, 'Thanh toán VNPay thành công', `Hóa đơn ${inv.id} đã được thanh toán ${expected.toLocaleString('vi-VN')}đ qua VNPay.`);
            }
        }
        else {
            await (0, query_1.query)(`UPDATE invoices
            SET vnp_response_code = $2
          WHERE id = $1`, [inv.id, verified.responseCode ?? null]);
        }
        return vnpay_1.VnpIpn.Success;
    }
    catch (err) {
        await logWebhookFailure('vnpay', vnpQuery, String(err));
        return vnpay_1.VnpIpn.UnknownError;
    }
}
// Thu ngân xác nhận đã thu tiền mặt — phải nhập received_amount và lưu lại
// để chống gian lận (không lưu được = không kiểm tra được).
async function payCash(id, input, actor) {
    if (actor.role !== 'cashier')
        throw new error_1.AppError(403, 'Chỉ thu ngân được xác nhận tiền mặt');
    const inv = await (0, query_1.queryOne)('SELECT * FROM invoices WHERE id = $1', [id]);
    if (!inv)
        throw new error_1.AppError(404, 'Hóa đơn không tồn tại');
    if (inv.payment_status === 'paid')
        throw new error_1.AppError(409, 'Hóa đơn đã thanh toán');
    // Số tiền nhận phải đủ — không cho phép cashier "xác nhận" mà không thu đủ.
    const finalAmount = Number(inv.final_amount);
    if (input.received_amount < finalAmount) {
        throw new error_1.AppError(400, `Số tiền nhận (${input.received_amount.toLocaleString('vi-VN')}đ) ` +
            `không đủ để thanh toán hóa đơn (${finalAmount.toLocaleString('vi-VN')}đ)`);
    }
    const updated = await (0, query_1.queryOne)(`UPDATE invoices
        SET payment_method = 'cash',
            payment_status = 'paid',
            cashier_user_id = $2,
            received_amount = $3,
            paid_at = NOW()
      WHERE id = $1 AND payment_status = 'pending' RETURNING *`, [id, actor.sub, input.received_amount.toFixed(2)]);
    if (!updated)
        throw new error_1.AppError(409, 'Hóa đơn đã được thanh toán bởi 1 phiên khác');
    const patient = await (0, query_1.queryOne)('SELECT user_id FROM patients WHERE id = $1', [inv.patient_id]);
    if (patient)
        await (0, notification_helper_1.notifyUser)(patient.user_id, 'Đã thanh toán tại quầy', `Hóa đơn ${id} đã được thu ngân xác nhận thanh toán.`);
    return loadDetail(id);
}
async function getInvoice(id, actor) {
    const detail = await loadDetail(id);
    if (actor.role === 'patient') {
        const pid = await patientIdOfUser(actor.sub);
        if (detail.patient_id !== pid)
            throw new error_1.AppError(403, 'Không có quyền');
    }
    else if (!['cashier', 'manager'].includes(actor.role)) {
        throw new error_1.AppError(403, 'Không có quyền');
    }
    return detail;
}
async function listInvoices(q, actor) {
    const where = [];
    const params = [];
    if (actor.role === 'patient') {
        const pid = await patientIdOfUser(actor.sub);
        params.push(pid);
        where.push(`patient_id = $${params.length}`);
    }
    else if (actor.role === 'cashier') {
        if (!q.payment_status) {
            where.push(`payment_status = 'pending'`);
        }
    }
    else if (actor.role !== 'manager') {
        throw new error_1.AppError(403, 'Không có quyền');
    }
    if (q.patient_id && actor.role !== 'patient') {
        params.push(q.patient_id);
        where.push(`patient_id = $${params.length}`);
    }
    if (q.payment_status) {
        params.push(q.payment_status);
        where.push(`payment_status = $${params.length}`);
    }
    if (q.from) {
        params.push(q.from);
        where.push(`created_at >= $${params.length}`);
    }
    if (q.to) {
        params.push(q.to);
        where.push(`created_at <= $${params.length}`);
    }
    const sql = `SELECT * FROM invoices
               ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
               ORDER BY created_at DESC LIMIT 200`;
    return (0, query_1.query)(sql, params);
}
// Doanh thu cho Manager — tính TỔNG mọi phương thức (vnpay + payos + cash).
// Trả thêm breakdown để FE hiển thị tách theo phương thức.
async function getRevenue(q, actor) {
    if (actor.role !== 'manager')
        throw new error_1.AppError(403, 'Chỉ quản lý xem doanh thu');
    const params = [q.year];
    let dateFilter = `EXTRACT(YEAR FROM paid_at) = $1`;
    if (q.month) {
        params.push(q.month);
        dateFilter += ` AND EXTRACT(MONTH FROM paid_at) = $2`;
    }
    const row = await (0, query_1.queryOne)(`SELECT COALESCE(SUM(final_amount), 0)::text AS total,
            COUNT(*) AS count,
            COALESCE(SUM(final_amount) FILTER (WHERE payment_method='vnpay'), 0)::text AS vnpay,
            COALESCE(SUM(final_amount) FILTER (WHERE payment_method='payos'), 0)::text AS payos,
            COALESCE(SUM(final_amount) FILTER (WHERE payment_method='cash'),  0)::text AS cash
       FROM invoices
      WHERE payment_status = 'paid'
        AND ${dateFilter}`, params);
    return {
        year: q.year,
        ...(q.month ? { month: q.month } : {}),
        total: row?.total ?? '0',
        count: Number(row?.count ?? 0),
        by_method: {
            vnpay: row?.vnpay ?? '0',
            payos: row?.payos ?? '0',
            cash: row?.cash ?? '0',
        },
    };
}
//# sourceMappingURL=invoices.service.js.map