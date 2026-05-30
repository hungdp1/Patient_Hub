"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const routes_1 = __importDefault(require("./routes"));
const env_1 = require("./config/env");
const error_1 = require("./middleware/error");
const rateLimit_1 = require("./middleware/rateLimit");
function createApp() {
    const app = (0, express_1.default)();
    // Khi deploy sau reverse proxy (nginx/cloudflare), phải set trust proxy
    // để Express tin X-Forwarded-For. Nếu không, clientIp() sẽ lấy IP của proxy
    // và có thể bị spoof.
    if (env_1.env.TRUST_PROXY > 0) {
        app.set('trust proxy', env_1.env.TRUST_PROXY);
    }
    app.use((0, helmet_1.default)());
    // CORS — dev mở rộng, production chỉ cho origin trong whitelist.
    if (env_1.env.CORS_ORIGINS) {
        const allowed = env_1.env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean);
        app.use((0, cors_1.default)({
            origin: (origin, cb) => {
                if (!origin || allowed.includes(origin))
                    cb(null, true);
                else
                    cb(new Error('Origin không được phép'));
            },
            credentials: true,
        }));
    }
    else {
        app.use((0, cors_1.default)());
    }
    // Giới hạn rõ ràng size body — chống upload payload khổng lồ làm DoS.
    app.use(express_1.default.json({ limit: '256kb' }));
    // Rate limit toàn cục — endpoint-specific (login, forgot-password) gắn riêng.
    app.use(rateLimit_1.globalLimiter);
    app.use('/api', routes_1.default);
    app.use(error_1.notFoundHandler);
    app.use(error_1.errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map