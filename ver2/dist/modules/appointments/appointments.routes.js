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
const appointments_schema_1 = require("./appointments.schema");
const appointmentsController = __importStar(require("./appointments.controller"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/', (0, auth_1.requireRole)('patient', 'receptionist', 'manager'), (0, validate_1.validate)({ body: appointments_schema_1.createAppointmentSchema }), appointmentsController.createAppointment);
router.get('/', (0, validate_1.validate)({ query: appointments_schema_1.listAppointmentQuerySchema }), appointmentsController.listAppointments);
router.get('/:id', (0, validate_1.validate)({ params: appointments_schema_1.idParamSchema }), appointmentsController.getAppointment);
// Bác sĩ: đã đặt → đang khám (tự tạo đợt khám).
router.post('/:id/start', (0, auth_1.requireRole)('doctor'), (0, validate_1.validate)({ params: appointments_schema_1.idParamSchema }), appointmentsController.startExamination);
// Bệnh nhân tự hủy / Quản lý hủy.
router.post('/:id/cancel', (0, auth_1.requireRole)('patient', 'manager'), (0, validate_1.validate)({ params: appointments_schema_1.idParamSchema }), appointmentsController.cancelAppointment);
// Quản lý đổi bác sĩ.
router.patch('/:id/reassign', (0, auth_1.requireRole)('manager'), (0, validate_1.validate)({ params: appointments_schema_1.idParamSchema, body: appointments_schema_1.reassignSchema }), appointmentsController.reassignDoctor);
exports.default = router;
//# sourceMappingURL=appointments.routes.js.map