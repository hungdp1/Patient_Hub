"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = signToken;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
// CHỈ cho phép HS256 — chặn key-confusion attack (alg:none, alg:RS256 với public key
// được dùng làm HMAC secret). Nếu không pin algorithm, jsonwebtoken sẽ chấp nhận
// bất kỳ thuật toán nào được khai báo trong header token.
const ALGO = 'HS256';
function signToken(payload) {
    const options = {
        algorithm: ALGO,
        expiresIn: env_1.env.JWT_EXPIRES_IN,
    };
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, options);
}
function verifyToken(token) {
    const opts = { algorithms: [ALGO] };
    const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET, opts);
    if (typeof decoded === 'string') {
        throw new Error('Token payload không hợp lệ');
    }
    return decoded;
}
//# sourceMappingURL=jwt.js.map