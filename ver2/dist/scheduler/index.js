"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSchedulers = startSchedulers;
exports.stopSchedulers = stopSchedulers;
const appointments_service_1 = require("../modules/appointments/appointments.service");
const ONE_HOUR_MS = 60 * 60 * 1000;
let timer = null;
async function runExpiryCheck() {
    try {
        const n = await (0, appointments_service_1.expireOverdueAppointments)();
        if (n > 0)
            console.log(`⏰ Đã đánh dấu ${n} lịch hẹn quá hạn`);
    }
    catch (err) {
        console.error('❌ Lỗi cron kiểm tra lịch hẹn quá hạn:', err);
    }
}
// Spec: hệ thống kiểm tra lịch hẹn quá hạn liên tục mỗi 1h.
function startSchedulers() {
    void runExpiryCheck();
    timer = setInterval(() => void runExpiryCheck(), ONE_HOUR_MS);
}
function stopSchedulers() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}
//# sourceMappingURL=index.js.map