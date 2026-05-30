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
const staff_schema_1 = require("./staff.schema");
const staffController = __importStar(require("./staff.controller"));
const router = (0, express_1.Router)();
// Toàn bộ module chỉ dành cho quản lý.
router.use(auth_1.authenticate, (0, auth_1.requireRole)('manager'));
// ─── Accounts ────────────────────────────────────────────────────────────────
router.get('/accounts', (0, validate_1.validate)({ query: staff_schema_1.listAccountsQuerySchema }), staffController.listAccounts);
router.patch('/accounts/:userId', (0, validate_1.validate)({ params: staff_schema_1.userIdParamSchema, body: staff_schema_1.setActiveSchema }), staffController.setAccountActive);
// Manager reset mật khẩu cho staff (doctor/technician/cashier/receptionist).
// Trả về mật khẩu mới — manager đọc và đưa tận tay nhân viên.
router.post('/accounts/:userId/reset-password', (0, validate_1.validate)({ params: staff_schema_1.userIdParamSchema }), staffController.resetStaffPassword);
// ─── Doctors ─────────────────────────────────────────────────────────────────
router.get('/doctors', staffController.listDoctors);
router.post('/doctors', (0, validate_1.validate)({ body: staff_schema_1.createDoctorSchema }), staffController.createDoctor);
router.get('/doctors/:id', (0, validate_1.validate)({ params: staff_schema_1.idParamSchema }), staffController.getDoctor);
router.patch('/doctors/:id', (0, validate_1.validate)({ params: staff_schema_1.idParamSchema, body: staff_schema_1.updateDoctorSchema }), staffController.updateDoctor);
// ─── Technicians ─────────────────────────────────────────────────────────────
router.get('/technicians', staffController.listTechnicians);
router.post('/technicians', (0, validate_1.validate)({ body: staff_schema_1.createTechnicianSchema }), staffController.createTechnician);
router.get('/technicians/:id', (0, validate_1.validate)({ params: staff_schema_1.idParamSchema }), staffController.getTechnician);
router.patch('/technicians/:id', (0, validate_1.validate)({ params: staff_schema_1.idParamSchema, body: staff_schema_1.updateTechnicianSchema }), staffController.updateTechnician);
// ─── Cashier / Receptionist ──────────────────────────────────────────────────
router.post('/cashiers', (0, validate_1.validate)({ body: staff_schema_1.createBasicStaffSchema }), staffController.createCashier);
router.post('/receptionists', (0, validate_1.validate)({ body: staff_schema_1.createBasicStaffSchema }), staffController.createReceptionist);
exports.default = router;
//# sourceMappingURL=staff.routes.js.map