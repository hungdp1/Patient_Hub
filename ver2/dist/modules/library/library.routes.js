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
const library_schema_1 = require("./library.schema");
const libraryController = __importStar(require("./library.controller"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// ─── Diseases ────────────────────────────────────────────────────────────────
router.get('/diseases', (0, validate_1.validate)({ query: library_schema_1.listDiseaseQuerySchema }), libraryController.listDiseases);
router.get('/diseases/:id', (0, validate_1.validate)({ params: library_schema_1.idParamSchema }), libraryController.getDisease);
router.post('/diseases', (0, auth_1.requireRole)('manager'), (0, validate_1.validate)({ body: library_schema_1.createDiseaseSchema }), libraryController.createDisease);
router.patch('/diseases/:id', (0, auth_1.requireRole)('manager'), (0, validate_1.validate)({ params: library_schema_1.idParamSchema, body: library_schema_1.updateDiseaseSchema }), libraryController.updateDisease);
router.delete('/diseases/:id', (0, auth_1.requireRole)('manager'), (0, validate_1.validate)({ params: library_schema_1.idParamSchema }), libraryController.deleteDisease);
// ─── Medicines ───────────────────────────────────────────────────────────────
router.get('/medicines', (0, validate_1.validate)({ query: library_schema_1.listNameQuerySchema }), libraryController.listMedicines);
router.get('/medicines/:id', (0, validate_1.validate)({ params: library_schema_1.idParamSchema }), libraryController.getMedicine);
router.post('/medicines', (0, auth_1.requireRole)('manager'), (0, validate_1.validate)({ body: library_schema_1.createMedicineSchema }), libraryController.createMedicine);
router.patch('/medicines/:id', (0, auth_1.requireRole)('manager'), (0, validate_1.validate)({ params: library_schema_1.idParamSchema, body: library_schema_1.updateMedicineSchema }), libraryController.updateMedicine);
router.delete('/medicines/:id', (0, auth_1.requireRole)('manager'), (0, validate_1.validate)({ params: library_schema_1.idParamSchema }), libraryController.deleteMedicine);
// ─── Test Types ───────────────────────────────────────────────────────────────
router.get('/test-types', (0, validate_1.validate)({ query: library_schema_1.listNameQuerySchema }), libraryController.listTestTypes);
router.get('/test-types/:id', (0, validate_1.validate)({ params: library_schema_1.idParamSchema }), libraryController.getTestType);
router.post('/test-types', (0, auth_1.requireRole)('manager'), (0, validate_1.validate)({ body: library_schema_1.createTestTypeSchema }), libraryController.createTestType);
router.patch('/test-types/:id', (0, auth_1.requireRole)('manager'), (0, validate_1.validate)({ params: library_schema_1.idParamSchema, body: library_schema_1.updateTestTypeSchema }), libraryController.updateTestType);
router.delete('/test-types/:id', (0, auth_1.requireRole)('manager'), (0, validate_1.validate)({ params: library_schema_1.idParamSchema }), libraryController.deleteTestType);
// ─── Procedures ──────────────────────────────────────────────────────────────
router.get('/procedures', (0, validate_1.validate)({ query: library_schema_1.listNameQuerySchema }), libraryController.listProcedures);
router.get('/procedures/:id', (0, validate_1.validate)({ params: library_schema_1.idParamSchema }), libraryController.getProcedure);
router.post('/procedures', (0, auth_1.requireRole)('manager'), (0, validate_1.validate)({ body: library_schema_1.createProcedureSchema }), libraryController.createProcedure);
router.patch('/procedures/:id', (0, auth_1.requireRole)('manager'), (0, validate_1.validate)({ params: library_schema_1.idParamSchema, body: library_schema_1.updateProcedureSchema }), libraryController.updateProcedure);
router.delete('/procedures/:id', (0, auth_1.requireRole)('manager'), (0, validate_1.validate)({ params: library_schema_1.idParamSchema }), libraryController.deleteProcedure);
exports.default = router;
//# sourceMappingURL=library.routes.js.map