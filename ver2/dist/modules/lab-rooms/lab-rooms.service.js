"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listLabRooms = listLabRooms;
exports.getLabRoom = getLabRoom;
exports.createLabRoom = createLabRoom;
exports.updateLabRoom = updateLabRoom;
exports.deleteLabRoom = deleteLabRoom;
const query_1 = require("../../db/query");
const error_1 = require("../../middleware/error");
async function listLabRooms(name) {
    if (name) {
        return (0, query_1.query)('SELECT * FROM lab_rooms WHERE name ILIKE $1 ORDER BY name ASC', [`%${name}%`]);
    }
    return (0, query_1.query)('SELECT * FROM lab_rooms ORDER BY name ASC');
}
async function getLabRoom(id) {
    const row = await (0, query_1.queryOne)('SELECT * FROM lab_rooms WHERE id = $1', [id]);
    if (!row)
        throw new error_1.AppError(404, 'Phòng xét nghiệm không tồn tại');
    return row;
}
async function createLabRoom(input) {
    const testTypeExists = await (0, query_1.queryOne)('SELECT id FROM lib_test_types WHERE id = $1', [input.test_type_id]);
    if (!testTypeExists)
        throw new error_1.AppError(404, 'Loại xét nghiệm không tồn tại');
    const row = await (0, query_1.queryOne)('INSERT INTO lab_rooms (name, test_type_id) VALUES ($1, $2) RETURNING *', [input.name, input.test_type_id]);
    return row;
}
async function updateLabRoom(id, input) {
    await getLabRoom(id);
    const sets = [];
    const params = [];
    let i = 1;
    if (input.name !== undefined) {
        sets.push(`name = $${i++}`);
        params.push(input.name);
    }
    if (input.test_type_id !== undefined) {
        const testTypeExists = await (0, query_1.queryOne)('SELECT id FROM lib_test_types WHERE id = $1', [input.test_type_id]);
        if (!testTypeExists)
            throw new error_1.AppError(404, 'Loại xét nghiệm không tồn tại');
        sets.push(`test_type_id = $${i++}`);
        params.push(input.test_type_id);
    }
    if (sets.length === 0)
        throw new error_1.AppError(400, 'Không có thông tin cần cập nhật');
    params.push(id);
    const row = await (0, query_1.queryOne)(`UPDATE lab_rooms SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, params);
    return row;
}
async function deleteLabRoom(id) {
    await getLabRoom(id);
    // technicians.lab_room_id is ON DELETE RESTRICT — kiểm tra trước
    const hasTechnician = await (0, query_1.queryOne)('SELECT id FROM technicians WHERE lab_room_id = $1 LIMIT 1', [id]);
    if (hasTechnician)
        throw new error_1.AppError(409, 'Không thể xóa phòng đang có kỹ thuật viên phụ trách');
    await (0, query_1.queryOne)('DELETE FROM lab_rooms WHERE id = $1 RETURNING id', [id]);
}
//# sourceMappingURL=lab-rooms.service.js.map