"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcAge = calcAge;
// Tính tuổi từ ngày sinh dạng 'YYYY-MM-DD' (DATE trả về string từ pg).
function calcAge(dob) {
    const b = new Date(`${dob}T00:00:00Z`);
    const now = new Date();
    let age = now.getUTCFullYear() - b.getUTCFullYear();
    const m = now.getUTCMonth() - b.getUTCMonth();
    if (m < 0 || (m === 0 && now.getUTCDate() < b.getUTCDate())) {
        age--;
    }
    return age;
}
//# sourceMappingURL=date.js.map