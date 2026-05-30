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
exports.listDiseases = listDiseases;
exports.getDisease = getDisease;
exports.createDisease = createDisease;
exports.updateDisease = updateDisease;
exports.deleteDisease = deleteDisease;
exports.listMedicines = listMedicines;
exports.getMedicine = getMedicine;
exports.createMedicine = createMedicine;
exports.updateMedicine = updateMedicine;
exports.deleteMedicine = deleteMedicine;
exports.listTestTypes = listTestTypes;
exports.getTestType = getTestType;
exports.createTestType = createTestType;
exports.updateTestType = updateTestType;
exports.deleteTestType = deleteTestType;
exports.listProcedures = listProcedures;
exports.getProcedure = getProcedure;
exports.createProcedure = createProcedure;
exports.updateProcedure = updateProcedure;
exports.deleteProcedure = deleteProcedure;
const libraryService = __importStar(require("./library.service"));
// ─── Diseases ────────────────────────────────────────────────────────────────
async function listDiseases(req, res) {
    const data = await libraryService.listDiseases(req.query);
    res.json({ data });
}
async function getDisease(req, res) {
    const data = await libraryService.getDisease(req.params['id']);
    res.json({ data });
}
async function createDisease(req, res) {
    const data = await libraryService.createDisease(req.body);
    res.status(201).json({ data });
}
async function updateDisease(req, res) {
    const data = await libraryService.updateDisease(req.params['id'], req.body);
    res.json({ data });
}
async function deleteDisease(req, res) {
    await libraryService.deleteDisease(req.params['id']);
    res.json({ message: 'Xóa bệnh thành công' });
}
// ─── Medicines ───────────────────────────────────────────────────────────────
async function listMedicines(req, res) {
    const data = await libraryService.listMedicines(req.query);
    res.json({ data });
}
async function getMedicine(req, res) {
    const data = await libraryService.getMedicine(req.params['id']);
    res.json({ data });
}
async function createMedicine(req, res) {
    const data = await libraryService.createMedicine(req.body);
    res.status(201).json({ data });
}
async function updateMedicine(req, res) {
    const data = await libraryService.updateMedicine(req.params['id'], req.body);
    res.json({ data });
}
async function deleteMedicine(req, res) {
    await libraryService.deleteMedicine(req.params['id']);
    res.json({ message: 'Xóa thuốc thành công' });
}
// ─── Test Types ───────────────────────────────────────────────────────────────
async function listTestTypes(req, res) {
    const data = await libraryService.listTestTypes(req.query);
    res.json({ data });
}
async function getTestType(req, res) {
    const data = await libraryService.getTestType(req.params['id']);
    res.json({ data });
}
async function createTestType(req, res) {
    const data = await libraryService.createTestType(req.body);
    res.status(201).json({ data });
}
async function updateTestType(req, res) {
    const data = await libraryService.updateTestType(req.params['id'], req.body);
    res.json({ data });
}
async function deleteTestType(req, res) {
    await libraryService.deleteTestType(req.params['id']);
    res.json({ message: 'Xóa loại xét nghiệm thành công' });
}
// ─── Procedures ──────────────────────────────────────────────────────────────
async function listProcedures(req, res) {
    const data = await libraryService.listProcedures(req.query);
    res.json({ data });
}
async function getProcedure(req, res) {
    const data = await libraryService.getProcedure(req.params['id']);
    res.json({ data });
}
async function createProcedure(req, res) {
    const data = await libraryService.createProcedure(req.body);
    res.status(201).json({ data });
}
async function updateProcedure(req, res) {
    const data = await libraryService.updateProcedure(req.params['id'], req.body);
    res.json({ data });
}
async function deleteProcedure(req, res) {
    await libraryService.deleteProcedure(req.params['id']);
    res.json({ message: 'Xóa quy trình thành công' });
}
//# sourceMappingURL=library.controller.js.map