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
exports.createPatient = createPatient;
exports.listPatients = listPatients;
exports.getMyProfile = getMyProfile;
exports.getPatient = getPatient;
exports.updatePatient = updatePatient;
exports.resetPassword = resetPassword;
const error_1 = require("../../middleware/error");
const patientsService = __importStar(require("./patients.service"));
async function createPatient(req, res) {
    const data = await patientsService.createPatient(req.body);
    res.status(201).json({ data });
}
async function listPatients(req, res) {
    const name = typeof req.query.name === 'string' ? req.query.name : undefined;
    const data = await patientsService.listPatients(name);
    res.json({ data });
}
// Bệnh nhân xem hồ sơ của chính mình.
async function getMyProfile(req, res) {
    if (!req.user)
        throw new error_1.AppError(401, 'Chưa xác thực');
    const data = await patientsService.getPatientByUserId(req.user.sub);
    res.json({ data });
}
async function getPatient(req, res) {
    const data = await patientsService.getPatientById(req.params['id']);
    res.json({ data });
}
async function updatePatient(req, res) {
    const data = await patientsService.updatePatient(req.params['id'], req.body);
    res.json({ data });
}
async function resetPassword(req, res) {
    await patientsService.resetPassword(req.params['id']);
    res.json({ message: 'Đã gửi mật khẩu mới đến số điện thoại bệnh nhân' });
}
//# sourceMappingURL=patients.controller.js.map