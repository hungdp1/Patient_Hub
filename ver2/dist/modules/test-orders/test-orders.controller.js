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
exports.createTestOrder = createTestOrder;
exports.getTestOrderDetail = getTestOrderDetail;
exports.listBySession = listBySession;
exports.listMySchedule = listMySchedule;
exports.technicianQueue = technicianQueue;
exports.updateItemStatus = updateItemStatus;
exports.cancelItem = cancelItem;
exports.reviewItem = reviewItem;
const error_1 = require("../../middleware/error");
const svc = __importStar(require("./test-orders.service"));
function actor(req) {
    if (!req.user)
        throw new error_1.AppError(401, 'Chưa xác thực');
    return req.user;
}
async function createTestOrder(req, res) {
    const data = await svc.createTestOrder(req.body, actor(req));
    res.status(201).json({ data });
}
async function getTestOrderDetail(req, res) {
    const data = await svc.getTestOrderDetail(req.params['id'], actor(req));
    res.json({ data });
}
async function listBySession(req, res) {
    const data = await svc.listBySession(req.query['session_id'], actor(req));
    res.json({ data });
}
async function listMySchedule(req, res) {
    const data = await svc.listMySchedule(actor(req));
    res.json({ data });
}
async function technicianQueue(req, res) {
    const data = await svc.technicianQueue(actor(req));
    res.json({ data });
}
async function updateItemStatus(req, res) {
    const data = await svc.updateItemStatus(req.params['itemId'], req.body, actor(req));
    res.json({ data });
}
async function cancelItem(req, res) {
    const data = await svc.cancelItem(req.params['itemId'], actor(req));
    res.json({ data });
}
async function reviewItem(req, res) {
    const data = await svc.reviewItem(req.params['itemId'], actor(req));
    res.json({ data });
}
//# sourceMappingURL=test-orders.controller.js.map