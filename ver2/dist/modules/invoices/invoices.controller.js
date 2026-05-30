"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = generate;
exports.payVnpay = payVnpay;
exports.vnpayReturn = vnpayReturn;
exports.payPayos = payPayos;
exports.payosWebhook = payosWebhook;
exports.vnpayIpn = vnpayIpn;
exports.payCash = payCash;
exports.get = get;
exports.list = list;
exports.revenue = revenue;
const error_1 = require("../../middleware/error");
const vnpay_1 = require("../../integrations/vnpay");
const svc = __importStar(require("./invoices.service"));
function actor(req) {
    if (!req.user)
        throw new error_1.AppError(401, 'Chưa xác thực');
    return req.user;
}
async function generate(req, res) {
    const data = await svc.generateInvoice(req.body, actor(req));
    res.status(201).json({ data });
}
async function payVnpay(req, res) {
    const bankCode = typeof req.body?.bank_code === 'string'
        ? req.body.bank_code
        : undefined;
    const data = await svc.payVnpay(req.params['id'], actor(req), (0, vnpay_1.clientIp)(req), bankCode);
    res.json({ data });
}
// Browser redirect — không yêu cầu auth, không tin để mark paid.
async function vnpayReturn(req, res) {
    const data = await svc.handleVnpayReturn(req.query);
    res.json({ data });
}
// ─── PayOS ─────────────────────────────────────────────────────────────────
async function payPayos(req, res) {
    const data = await svc.payPayos(req.params['id'], actor(req));
    res.json({ data });
}
// Webhook PayOS — public, server-to-server.
// PayOS expect HTTP 200 với JSON; chữ ký sai vẫn trả 200 để tránh PayOS retry mãi.
async function payosWebhook(req, res) {
    // IP whitelist (chỉ áp dụng nếu PAYOS_ALLOWED_IPS được cấu hình).
    if (!(0, vnpay_1.isPayosIpAllowed)((0, vnpay_1.clientIp)(req))) {
        console.warn(`⚠️ PayOS webhook từ IP không trong whitelist: ${(0, vnpay_1.clientIp)(req)}`);
        res.json({ error: 1, message: 'IP không được phép' });
        return;
    }
    try {
        const result = await svc.handlePayosWebhook(req.body);
        res.json(result);
    }
    catch (err) {
        console.error('❌ PayOS webhook handler crash:', err);
        res.json({ error: 1, message: 'Unknown error' });
    }
}
// IPN — server-to-server. Trả về EXACTLY format VNPay expects.
async function vnpayIpn(req, res) {
    // Optional IP whitelist — bật bằng VNP_ALLOWED_IPS.
    if (!(0, vnpay_1.isIpAllowed)((0, vnpay_1.clientIp)(req))) {
        res.json({ RspCode: '99', Message: 'IP không được phép' });
        return;
    }
    try {
        const result = await svc.handleVnpayIpn(req.query);
        res.json(result);
    }
    catch (err) {
        console.error('❌ VNPay IPN handler crash:', err);
        res.json(vnpay_1.VnpIpn.UnknownError);
    }
}
async function payCash(req, res) {
    const data = await svc.payCash(req.params['id'], req.body, actor(req));
    res.json({ data });
}
async function get(req, res) {
    const data = await svc.getInvoice(req.params['id'], actor(req));
    res.json({ data });
}
async function list(req, res) {
    const data = await svc.listInvoices(req.query, actor(req));
    res.json({ data });
}
async function revenue(req, res) {
    const data = await svc.getRevenue(req.query, actor(req));
    res.json({ data });
}
//# sourceMappingURL=invoices.controller.js.map