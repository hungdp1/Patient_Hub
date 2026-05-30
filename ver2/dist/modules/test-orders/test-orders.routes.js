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
const test_orders_schema_1 = require("./test-orders.schema");
const ctrl = __importStar(require("./test-orders.controller"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/', (0, auth_1.requireRole)('doctor'), (0, validate_1.validate)({ body: test_orders_schema_1.createTestOrderSchema }), ctrl.createTestOrder);
// Bác sĩ xem yêu cầu xét nghiệm theo đợt khám (?session_id=).
router.get('/', (0, auth_1.requireRole)('doctor'), (0, validate_1.validate)({ query: test_orders_schema_1.listBySessionQuerySchema }), ctrl.listBySession);
// Bệnh nhân: lịch xét nghiệm của mình (thời gian thực).
router.get('/me', (0, auth_1.requireRole)('patient'), ctrl.listMySchedule);
// KTV: hàng chờ phòng mình phụ trách.
router.get('/technician/queue', (0, auth_1.requireRole)('technician'), ctrl.technicianQueue);
// Thao tác trên từng mục xét nghiệm — đặt trước '/:id'.
router.patch('/items/:itemId/status', (0, auth_1.requireRole)('technician'), (0, validate_1.validate)({ params: test_orders_schema_1.itemIdParamSchema, body: test_orders_schema_1.updateItemStatusSchema }), ctrl.updateItemStatus);
router.post('/items/:itemId/cancel', (0, auth_1.requireRole)('technician'), (0, validate_1.validate)({ params: test_orders_schema_1.itemIdParamSchema }), ctrl.cancelItem);
router.patch('/items/:itemId/review', (0, auth_1.requireRole)('doctor'), (0, validate_1.validate)({ params: test_orders_schema_1.itemIdParamSchema }), ctrl.reviewItem);
router.get('/:id', (0, auth_1.requireRole)('doctor', 'patient'), (0, validate_1.validate)({ params: test_orders_schema_1.idParamSchema }), ctrl.getTestOrderDetail);
exports.default = router;
//# sourceMappingURL=test-orders.routes.js.map