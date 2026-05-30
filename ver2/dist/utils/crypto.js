"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
const node_crypto_1 = __importDefault(require("node:crypto"));
const env_1 = require("../config/env");
// AES-256-GCM cho dữ liệu nhạy cảm (phone, insurance number).
// Format lưu DB: base64(iv).base64(authTag).base64(ciphertext)
const KEY = Buffer.from(env_1.env.AES_KEY, 'hex'); // 32 bytes
const IV_LENGTH = 12; // GCM khuyến nghị 12 bytes
const ALGO = 'aes-256-gcm';
function encrypt(plaintext) {
    const iv = node_crypto_1.default.randomBytes(IV_LENGTH);
    const cipher = node_crypto_1.default.createCipheriv(ALGO, KEY, iv);
    const ciphertext = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    return [
        iv.toString('base64'),
        authTag.toString('base64'),
        ciphertext.toString('base64'),
    ].join('.');
}
function decrypt(payload) {
    const parts = payload.split('.');
    if (parts.length !== 3) {
        throw new Error('Ciphertext không đúng định dạng');
    }
    const [ivB64, tagB64, dataB64] = parts;
    const iv = Buffer.from(ivB64, 'base64');
    const authTag = Buffer.from(tagB64, 'base64');
    const data = Buffer.from(dataB64, 'base64');
    const decipher = node_crypto_1.default.createDecipheriv(ALGO, KEY, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}
//# sourceMappingURL=crypto.js.map