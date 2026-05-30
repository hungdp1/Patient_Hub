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
exports.listAccounts = listAccounts;
exports.setAccountActive = setAccountActive;
exports.createDoctor = createDoctor;
exports.listDoctors = listDoctors;
exports.getDoctor = getDoctor;
exports.updateDoctor = updateDoctor;
exports.createTechnician = createTechnician;
exports.listTechnicians = listTechnicians;
exports.getTechnician = getTechnician;
exports.updateTechnician = updateTechnician;
exports.createCashier = createCashier;
exports.createReceptionist = createReceptionist;
exports.resetStaffPassword = resetStaffPassword;
const error_1 = require("../../middleware/error");
const staffService = __importStar(require("./staff.service"));
// ─── Accounts ────────────────────────────────────────────────────────────────
async function listAccounts(req, res) {
    const data = await staffService.listAccounts(req.query);
    res.json({ data });
}
async function setAccountActive(req, res) {
    if (!req.user)
        throw new error_1.AppError(401, 'Chưa xác thực');
    const { is_active } = req.body;
    const data = await staffService.setAccountActive(req.params['userId'], req.user.sub, is_active);
    res.json({ data });
}
// ─── Doctors ─────────────────────────────────────────────────────────────────
async function createDoctor(req, res) {
    const data = await staffService.createDoctor(req.body);
    res.status(201).json({ data });
}
async function listDoctors(_req, res) {
    const data = await staffService.listDoctors();
    res.json({ data });
}
async function getDoctor(req, res) {
    const data = await staffService.getDoctor(req.params['id']);
    res.json({ data });
}
async function updateDoctor(req, res) {
    const data = await staffService.updateDoctor(req.params['id'], req.body);
    res.json({ data });
}
// ─── Technicians ─────────────────────────────────────────────────────────────
async function createTechnician(req, res) {
    const data = await staffService.createTechnician(req.body);
    res.status(201).json({ data });
}
async function listTechnicians(_req, res) {
    const data = await staffService.listTechnicians();
    res.json({ data });
}
async function getTechnician(req, res) {
    const data = await staffService.getTechnician(req.params['id']);
    res.json({ data });
}
async function updateTechnician(req, res) {
    const data = await staffService.updateTechnician(req.params['id'], req.body);
    res.json({ data });
}
// ─── Cashier / Receptionist ──────────────────────────────────────────────────
async function createCashier(req, res) {
    const data = await staffService.createCashier(req.body);
    res.status(201).json({ data });
}
async function createReceptionist(req, res) {
    const data = await staffService.createReceptionist(req.body);
    res.status(201).json({ data });
}
async function resetStaffPassword(req, res) {
    if (!req.user)
        throw new error_1.AppError(401, 'Chưa xác thực');
    const data = await staffService.resetStaffPassword(req.params['userId'], req.user.sub);
    res.json({ data });
}
//# sourceMappingURL=staff.controller.js.map