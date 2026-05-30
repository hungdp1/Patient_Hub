"use strict";
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
const query_1 = require("../../db/query");
const error_1 = require("../../middleware/error");
// Helper: build a dynamic SET clause for partial updates.
// Returns { sets, params } where params does NOT include the WHERE id param.
function buildSets(fields) {
    const sets = [];
    const params = [];
    let i = 1;
    for (const [col, val] of Object.entries(fields)) {
        if (val !== undefined) {
            sets.push(`${col} = $${i++}`);
            params.push(val === null ? null : val);
        }
    }
    return { sets, params, nextIdx: i };
}
// ═══════════════════════════════════════════════════════════════════════════
// DISEASES
// ═══════════════════════════════════════════════════════════════════════════
async function listDiseases(q) {
    const conditions = ['1=1'];
    const params = [];
    let i = 1;
    if (q.name) {
        conditions.push(`name ILIKE $${i++}`);
        params.push(`%${q.name}%`);
    }
    if (q.department_id) {
        conditions.push(`department_id = $${i++}`);
        params.push(q.department_id);
    }
    return (0, query_1.query)(`SELECT * FROM lib_diseases WHERE ${conditions.join(' AND ')} ORDER BY name ASC`, params);
}
async function getDisease(id) {
    const row = await (0, query_1.queryOne)('SELECT * FROM lib_diseases WHERE id = $1', [id]);
    if (!row)
        throw new error_1.AppError(404, 'Bệnh không tồn tại');
    return row;
}
async function createDisease(input) {
    const row = await (0, query_1.queryOne)(`INSERT INTO lib_diseases (name, symptoms, description, treatment, department_id)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`, [
        input.name,
        input.symptoms ?? null,
        input.description ?? null,
        input.treatment ?? null,
        input.department_id ?? null,
    ]);
    return row;
}
async function updateDisease(id, input) {
    await getDisease(id);
    const { sets, params, nextIdx } = buildSets({
        name: input.name,
        symptoms: input.symptoms,
        description: input.description,
        treatment: input.treatment,
        department_id: input.department_id,
    });
    if (sets.length === 0)
        throw new error_1.AppError(400, 'Không có thông tin cần cập nhật');
    params.push(id);
    const row = await (0, query_1.queryOne)(`UPDATE lib_diseases SET ${sets.join(', ')} WHERE id = $${nextIdx} RETURNING *`, params);
    return row;
}
async function deleteDisease(id) {
    await getDisease(id);
    await (0, query_1.queryOne)('DELETE FROM lib_diseases WHERE id = $1 RETURNING id', [id]);
}
// ═══════════════════════════════════════════════════════════════════════════
// MEDICINES
// ═══════════════════════════════════════════════════════════════════════════
async function listMedicines(q) {
    if (q.name) {
        return (0, query_1.query)('SELECT * FROM lib_medicines WHERE name ILIKE $1 ORDER BY name ASC', [`%${q.name}%`]);
    }
    return (0, query_1.query)('SELECT * FROM lib_medicines ORDER BY name ASC');
}
async function getMedicine(id) {
    const row = await (0, query_1.queryOne)('SELECT * FROM lib_medicines WHERE id = $1', [id]);
    if (!row)
        throw new error_1.AppError(404, 'Thuốc không tồn tại');
    return row;
}
async function createMedicine(input) {
    const row = await (0, query_1.queryOne)(`INSERT INTO lib_medicines (name, description, usage, side_effects, price, insurance_price)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [
        input.name,
        input.description ?? null,
        input.usage ?? null,
        input.side_effects ?? null,
        input.price,
        input.insurance_price,
    ]);
    return row;
}
async function updateMedicine(id, input) {
    await getMedicine(id);
    const { sets, params, nextIdx } = buildSets({
        name: input.name,
        description: input.description,
        usage: input.usage,
        side_effects: input.side_effects,
        price: input.price,
        insurance_price: input.insurance_price,
    });
    if (sets.length === 0)
        throw new error_1.AppError(400, 'Không có thông tin cần cập nhật');
    params.push(id);
    const row = await (0, query_1.queryOne)(`UPDATE lib_medicines SET ${sets.join(', ')} WHERE id = $${nextIdx} RETURNING *`, params);
    return row;
}
async function deleteMedicine(id) {
    await getMedicine(id);
    const inUse = await (0, query_1.queryOne)('SELECT id FROM prescription_items WHERE medicine_id = $1 LIMIT 1', [id]);
    if (inUse)
        throw new error_1.AppError(409, 'Không thể xóa thuốc đang được dùng trong đơn thuốc');
    await (0, query_1.queryOne)('DELETE FROM lib_medicines WHERE id = $1 RETURNING id', [id]);
}
// ═══════════════════════════════════════════════════════════════════════════
// TEST TYPES
// ═══════════════════════════════════════════════════════════════════════════
async function listTestTypes(q) {
    if (q.name) {
        return (0, query_1.query)('SELECT * FROM lib_test_types WHERE name ILIKE $1 ORDER BY name ASC', [`%${q.name}%`]);
    }
    return (0, query_1.query)('SELECT * FROM lib_test_types ORDER BY name ASC');
}
async function getTestType(id) {
    const row = await (0, query_1.queryOne)('SELECT * FROM lib_test_types WHERE id = $1', [id]);
    if (!row)
        throw new error_1.AppError(404, 'Loại xét nghiệm không tồn tại');
    return row;
}
async function createTestType(input) {
    const row = await (0, query_1.queryOne)(`INSERT INTO lib_test_types (name, description, estimated_minutes, price, insurance_price)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`, [
        input.name,
        input.description ?? null,
        input.estimated_minutes,
        input.price,
        input.insurance_price,
    ]);
    return row;
}
async function updateTestType(id, input) {
    await getTestType(id);
    const { sets, params, nextIdx } = buildSets({
        name: input.name,
        description: input.description,
        estimated_minutes: input.estimated_minutes,
        price: input.price,
        insurance_price: input.insurance_price,
    });
    if (sets.length === 0)
        throw new error_1.AppError(400, 'Không có thông tin cần cập nhật');
    params.push(id);
    const row = await (0, query_1.queryOne)(`UPDATE lib_test_types SET ${sets.join(', ')} WHERE id = $${nextIdx} RETURNING *`, params);
    return row;
}
async function deleteTestType(id) {
    await getTestType(id);
    const hasLabRoom = await (0, query_1.queryOne)('SELECT id FROM lab_rooms WHERE test_type_id = $1 LIMIT 1', [id]);
    if (hasLabRoom)
        throw new error_1.AppError(409, 'Không thể xóa loại xét nghiệm đang được gán cho phòng');
    const inUse = await (0, query_1.queryOne)('SELECT id FROM test_order_items WHERE test_type_id = $1 LIMIT 1', [id]);
    if (inUse)
        throw new error_1.AppError(409, 'Không thể xóa loại xét nghiệm đang được dùng trong yêu cầu xét nghiệm');
    await (0, query_1.queryOne)('DELETE FROM lib_test_types WHERE id = $1 RETURNING id', [id]);
}
// ═══════════════════════════════════════════════════════════════════════════
// PROCEDURES
// ═══════════════════════════════════════════════════════════════════════════
async function listProcedures(q) {
    if (q.name) {
        return (0, query_1.query)('SELECT * FROM lib_procedures WHERE name ILIKE $1 ORDER BY name ASC', [`%${q.name}%`]);
    }
    return (0, query_1.query)('SELECT * FROM lib_procedures ORDER BY name ASC');
}
async function getProcedure(id) {
    const row = await (0, query_1.queryOne)('SELECT * FROM lib_procedures WHERE id = $1', [id]);
    if (!row)
        throw new error_1.AppError(404, 'Quy trình khám không tồn tại');
    return row;
}
async function createProcedure(input) {
    const row = await (0, query_1.queryOne)('INSERT INTO lib_procedures (name, description) VALUES ($1, $2) RETURNING *', [input.name, input.description ?? null]);
    return row;
}
async function updateProcedure(id, input) {
    await getProcedure(id);
    const { sets, params, nextIdx } = buildSets({
        name: input.name,
        description: input.description,
    });
    if (sets.length === 0)
        throw new error_1.AppError(400, 'Không có thông tin cần cập nhật');
    params.push(id);
    const row = await (0, query_1.queryOne)(`UPDATE lib_procedures SET ${sets.join(', ')} WHERE id = $${nextIdx} RETURNING *`, params);
    return row;
}
async function deleteProcedure(id) {
    await getProcedure(id);
    await (0, query_1.queryOne)('DELETE FROM lib_procedures WHERE id = $1 RETURNING id', [id]);
}
//# sourceMappingURL=library.service.js.map