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
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const validate_1 = require("../../middleware/validate");
const invoices_schema_1 = require("./invoices.schema");
const ctrl = __importStar(require("./invoices.controller"));
const router = (0, express_1.Router)();
// ─── Public endpoints (VNPay + PayOS callbacks) ──────────────────────────────
// Cổng thanh toán gọi trực tiếp, không có Bearer token.
// Phải đặt TRƯỚC middleware auth.
router.get('/vnpay-return', ctrl.vnpayReturn);
router.get('/vnpay-ipn', ctrl.vnpayIpn);
// PayOS dùng POST + JSON body, signature trong body.
router.post('/payos-webhook', ctrl.payosWebhook);
// ─── Các endpoint còn lại đều cần auth ──────────────────────────────────────
router.use(auth_1.authenticate);
router.post('/generate', (0, auth_1.requireRole)('cashier', 'patient'), (0, validate_1.validate)({ body: invoices_schema_1.generateInvoiceSchema }), ctrl.generate);
router.post('/:id/pay-vnpay', (0, auth_1.requireRole)('patient'), (0, validate_1.validate)({ params: invoices_schema_1.idParamSchema, body: invoices_schema_1.payVnpaySchema }), ctrl.payVnpay);
router.post('/:id/pay-payos', (0, auth_1.requireRole)('patient'), (0, validate_1.validate)({ params: invoices_schema_1.idParamSchema }), ctrl.payPayos);
router.post('/:id/pay-cash', (0, auth_1.requireRole)('cashier'), (0, validate_1.validate)({ params: invoices_schema_1.idParamSchema, body: invoices_schema_1.payCashSchema }), ctrl.payCash);
router.get('/revenue', (0, auth_1.requireRole)('manager'), (0, validate_1.validate)({ query: invoices_schema_1.revenueQuerySchema }), ctrl.revenue);
router.get('/', (0, auth_1.requireRole)('patient', 'cashier', 'manager'), (0, validate_1.validate)({ query: invoices_schema_1.listQuerySchema }), ctrl.list);
router.get('/:id', (0, auth_1.requireRole)('patient', 'cashier', 'manager'), (0, validate_1.validate)({ params: invoices_schema_1.idParamSchema }), ctrl.get);
exports.default = router;
//# sourceMappingURL=invoices.routes.js.map