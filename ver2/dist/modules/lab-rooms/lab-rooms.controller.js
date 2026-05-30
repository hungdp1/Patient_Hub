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
exports.listLabRooms = listLabRooms;
exports.getLabRoom = getLabRoom;
exports.createLabRoom = createLabRoom;
exports.updateLabRoom = updateLabRoom;
exports.deleteLabRoom = deleteLabRoom;
const labRoomsService = __importStar(require("./lab-rooms.service"));
async function listLabRooms(req, res) {
    const name = typeof req.query.name === 'string' ? req.query.name : undefined;
    const data = await labRoomsService.listLabRooms(name);
    res.json({ data });
}
async function getLabRoom(req, res) {
    const data = await labRoomsService.getLabRoom(req.params['id']);
    res.json({ data });
}
async function createLabRoom(req, res) {
    const data = await labRoomsService.createLabRoom(req.body);
    res.status(201).json({ data });
}
async function updateLabRoom(req, res) {
    const data = await labRoomsService.updateLabRoom(req.params['id'], req.body);
    res.json({ data });
}
async function deleteLabRoom(req, res) {
    await labRoomsService.deleteLabRoom(req.params['id']);
    res.json({ message: 'Xóa phòng xét nghiệm thành công' });
}
//# sourceMappingURL=lab-rooms.controller.js.map