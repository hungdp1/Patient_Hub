"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revenueQuerySchema = exports.listQuerySchema = exports.payVnpaySchema = exports.payCashSchema = exports.generateInvoiceSchema = exports.idParamSchema = void 0;
const zod_1 = require("zod");
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('ID không hợp lệ'),
});
exports.generateInvoiceSchema = zod_1.z.object({
    session_id: zod_1.z.string().uuid('session_id không hợp lệ'),
});
// Bắt buộc nhập số tiền cashier nhận thực tế — kiểm tra >= final_amount
// trong service để chống gian lận nội bộ.
exports.payCashSchema = zod_1.z.object({
    received_amount: zod_1.z.number().nonnegative('Số tiền nhận không hợp lệ'),
});
// VNPay cho phép truyền vnp_BankCode để pre-select cổng (NCB, VNBANK, INTCARD...).
// Bỏ trống = hiện màn hình chọn ngân hàng của VNPay.
exports.payVnpaySchema = zod_1.z.object({
    bank_code: zod_1.z.string().min(2).max(20).optional(),
});
exports.listQuerySchema = zod_1.z.object({
    patient_id: zod_1.z.string().uuid().optional(),
    payment_status: zod_1.z.enum(['pending', 'paid']).optional(),
    from: zod_1.z.string().optional(),
    to: zod_1.z.string().optional(),
});
exports.revenueQuerySchema = zod_1.z.object({
    year: zod_1.z.coerce.number().int().min(2000).max(2100),
    month: zod_1.z.coerce.number().int().min(1).max(12).optional(),
});
//# sourceMappingURL=invoices.schema.js.map