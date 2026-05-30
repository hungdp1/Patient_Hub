"use strict";
// Kiểu dữ liệu khớp 1-1 với schema PostgreSQL (migrations/0001_init.sql).
// Quy ước map kiểu (tránh bug phổ biến của node-postgres):
//   UUID/TEXT/VARCHAR -> string
//   TIMESTAMPTZ        -> Date
//   DATE               -> string 'YYYY-MM-DD'  (pool cấu hình trả string, tránh lệch timezone)
//   NUMERIC            -> string               (giữ nguyên precision, KHÔNG dùng number)
//   BOOLEAN            -> boolean
//   INT                -> number
//   JSONB              -> unknown
Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=db.js.map