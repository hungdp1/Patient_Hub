"use strict";
// ─────────────────────────────────────────────────────────────────────────────
// Tích hợp PayOS (VietQR, chuyển khoản ngân hàng, ví điện tử).
//
// Luồng:
//   1. BE gọi paymentRequests.create({ orderCode, amount, ... }) → trả
//      { checkoutUrl, qrCode, paymentLinkId, accountNumber, ... }.
//   2. FE redirect user sang checkoutUrl (hoặc hiển thị qrCode để quét VietQR).
//   3. User chuyển khoản → PayOS đối soát qua bank API → gửi webhook về BE.
//   4. BE gọi webhooks.verify(body) để xác minh chữ ký → mark invoice paid.
//
// Khác VNPay: PayOS dùng orderCode KIỂU SỐ (number, unique trong merchant).
// Description giới hạn 25 ký tự.
//
// Docs: https://payos.vn/docs/
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.payosClient = payosClient;
exports.generateOrderCode = generateOrderCode;
exports.createPaymentLink = createPaymentLink;
exports.verifyWebhook = verifyWebhook;
exports.confirmWebhook = confirmWebhook;
exports.getPaymentInfo = getPaymentInfo;
exports.cancelPaymentLink = cancelPaymentLink;
const node_1 = require("@payos/node");
const env_1 = require("../config/env");
function assertConfig() {
    if (!env_1.env.PAYOS_CLIENT_ID || !env_1.env.PAYOS_API_KEY || !env_1.env.PAYOS_CHECKSUM_KEY) {
        throw new Error('Thiếu cấu hình PayOS: cần PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY ' +
            'trong .env. Đăng ký kênh thanh toán tại https://my.payos.vn');
    }
    return {
        clientId: env_1.env.PAYOS_CLIENT_ID,
        apiKey: env_1.env.PAYOS_API_KEY,
        checksumKey: env_1.env.PAYOS_CHECKSUM_KEY,
    };
}
let _client = null;
function payosClient() {
    if (_client)
        return _client;
    const { clientId, apiKey, checksumKey } = assertConfig();
    _client = new node_1.PayOS({ clientId, apiKey, checksumKey });
    return _client;
}
// PayOS yêu cầu orderCode là number unique. Dùng millisecond timestamp +
// 3 chữ số ngẫu nhiên — đủ unique và nằm gọn trong JS safe integer
// (Number.MAX_SAFE_INTEGER = 9_007_199_254_740_991).
function generateOrderCode() {
    const ts = Date.now(); // 13 digits
    const rand = Math.floor(Math.random() * 1000); // 0-999
    return ts * 1000 + rand;
}
async function createPaymentLink(input) {
    const desc = input.description.slice(0, 25); // PayOS hard limit
    const res = await payosClient().paymentRequests.create({
        orderCode: input.orderCode,
        amount: input.amount,
        description: desc,
        cancelUrl: env_1.env.PAYOS_CANCEL_URL,
        returnUrl: env_1.env.PAYOS_RETURN_URL,
        ...(input.buyerName ? { buyerName: input.buyerName } : {}),
        ...(input.buyerPhone ? { buyerPhone: input.buyerPhone } : {}),
    });
    return {
        checkoutUrl: res.checkoutUrl,
        qrCode: res.qrCode,
        paymentLinkId: res.paymentLinkId,
        orderCode: res.orderCode,
        amount: res.amount,
        accountNumber: res.accountNumber,
        accountName: res.accountName,
        bin: res.bin,
        status: res.status,
    };
}
// Verify webhook — throw InvalidSignatureError nếu sai. Service phải bắt
// để trả response phù hợp (PayOS expect HTTP 200 với JSON ack đơn giản).
async function verifyWebhook(body) {
    return payosClient().webhooks.verify(body);
}
// Đăng ký webhook URL với PayOS (PayOS sẽ test bằng request thử).
// Dùng để chạy 1 lần sau khi deploy / khi đổi domain.
async function confirmWebhook(url) {
    const res = await payosClient().webhooks.confirm(url);
    return { webhookUrl: res.webhookUrl };
}
// Truy vấn trạng thái link bằng orderCode.
async function getPaymentInfo(orderCode) {
    return payosClient().paymentRequests.get(orderCode);
}
// Hủy link nếu user bỏ ngang (tránh để link mở vô thời hạn).
async function cancelPaymentLink(orderCode, reason) {
    await payosClient().paymentRequests.cancel(orderCode, reason);
}
//# sourceMappingURL=payos.js.map