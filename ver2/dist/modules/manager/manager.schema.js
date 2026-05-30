"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardQuerySchema = void 0;
const zod_1 = require("zod");
exports.dashboardQuerySchema = zod_1.z.object({
    year: zod_1.z.coerce.number().int().min(2000).max(2100).optional(),
    month: zod_1.z.coerce.number().int().min(1).max(12).optional(),
});
//# sourceMappingURL=manager.schema.js.map