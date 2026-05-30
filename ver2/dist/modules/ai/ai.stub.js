"use strict";
// ─────────────────────────────────────────────────────────────────────────────
// STUB AI — điểm cắm cho Random Forest (dự đoán bệnh) + RAG/Gemini (NLP chatbot)
// và Reinforcement Learning (xếp thứ tự phòng xét nghiệm).
//
// Hiện trả kết quả mặc định để hệ thống chạy được không cần model/API key.
// Khi tích hợp thật: thay phần thân hàm, KHÔNG đổi chữ ký hàm.
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.predictDiseaseDepartment = predictDiseaseDepartment;
exports.scheduleTestRooms = scheduleTestRooms;
// Random Forest + RAG/Gemini cắm vào đây.
async function predictDiseaseDepartment(_symptoms) {
    return { departmentId: null, diseaseName: null, advice: null };
}
// RL cắm vào đây. Hiện dùng greedy deterministic: gán phòng ít hàng chờ nhất,
// xếp thứ tự ưu tiên xét nghiệm nhanh trước để giảm tổng thời gian chờ.
function scheduleTestRooms(items) {
    const queue = new Map();
    for (const it of items) {
        for (const r of it.candidateRooms) {
            if (!queue.has(r.labRoomId))
                queue.set(r.labRoomId, r.currentQueue);
        }
    }
    const ordered = [...items].sort((a, b) => a.estimatedMinutes - b.estimatedMinutes);
    const results = [];
    let order = 1;
    for (const it of ordered) {
        let best = null;
        for (const r of it.candidateRooms) {
            const load = queue.get(r.labRoomId) ?? r.currentQueue;
            if (!best || load < best.load)
                best = { labRoomId: r.labRoomId, load };
        }
        if (!best) {
            results.push({ itemId: it.itemId, labRoomId: null, scheduleOrder: 0 });
            continue;
        }
        queue.set(best.labRoomId, best.load + 1);
        results.push({
            itemId: it.itemId,
            labRoomId: best.labRoomId,
            scheduleOrder: order++,
        });
    }
    return results;
}
//# sourceMappingURL=ai.stub.js.map