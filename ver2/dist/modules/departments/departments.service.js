"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDepartments = listDepartments;
exports.getDepartment = getDepartment;
exports.createDepartment = createDepartment;
exports.updateDepartment = updateDepartment;
exports.deleteDepartment = deleteDepartment;
const query_1 = require("../../db/query");
const error_1 = require("../../middleware/error");
async function listDepartments(name) {
    if (name) {
        return (0, query_1.query)('SELECT * FROM departments WHERE name ILIKE $1 ORDER BY name ASC', [`%${name}%`]);
    }
    return (0, query_1.query)('SELECT * FROM departments ORDER BY name ASC');
}
async function getDepartment(id) {
    const row = await (0, query_1.queryOne)('SELECT * FROM departments WHERE id = $1', [id]);
    if (!row)
        throw new error_1.AppError(404, 'Khoa không tồn tại');
    return row;
}
async function createDepartment(input) {
    const dup = await (0, query_1.queryOne)('SELECT id FROM departments WHERE name = $1', [
        input.name,
    ]);
    if (dup)
        throw new error_1.AppError(409, 'Tên khoa đã tồn tại');
    const row = await (0, query_1.queryOne)('INSERT INTO departments (name, description) VALUES ($1, $2) RETURNING *', [input.name, input.description ?? null]);
    return row;
}
async function updateDepartment(id, input) {
    await getDepartment(id);
    const sets = [];
    const params = [];
    let i = 1;
    if (input.name !== undefined) {
        const dup = await (0, query_1.queryOne)('SELECT id FROM departments WHERE name = $1 AND id <> $2', [input.name, id]);
        if (dup)
            throw new error_1.AppError(409, 'Tên khoa đã tồn tại');
        sets.push(`name = $${i++}`);
        params.push(input.name);
    }
    if (input.description !== undefined) {
        sets.push(`description = $${i++}`);
        params.push(input.description);
    }
    if (sets.length === 0)
        throw new error_1.AppError(400, 'Không có thông tin cần cập nhật');
    params.push(id);
    const row = await (0, query_1.queryOne)(`UPDATE departments SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, params);
    return row;
}
async function deleteDepartment(id) {
    await getDepartment(id);
    const hasDoctors = await (0, query_1.queryOne)('SELECT id FROM doctors WHERE department_id = $1 LIMIT 1', [id]);
    if (hasDoctors)
        throw new error_1.AppError(409, 'Không thể xóa khoa đang có bác sĩ');
    const hasDiseases = await (0, query_1.queryOne)('SELECT id FROM lib_diseases WHERE department_id = $1 LIMIT 1', [id]);
    if (hasDiseases)
        throw new error_1.AppError(409, 'Không thể xóa khoa đang có bệnh liên kết');
    await (0, query_1.queryOne)('DELETE FROM departments WHERE id = $1 RETURNING id', [id]);
}
//# sourceMappingURL=departments.service.js.map