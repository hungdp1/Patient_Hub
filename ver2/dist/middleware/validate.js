"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
// Validate + ép kiểu req.body/query/params. Lỗi ZodError được errorHandler bắt -> 400.
//
// Express 5: req.query trở thành getter (read-only assign). Object.assign chỉ
// merge — không xóa key cũ. Để tránh kẹt key không qua validate, ta:
//   1. xóa key gốc trước khi gán
//   2. dùng Object.assign vào object cũ (giữ reference)
function replaceProps(target, source) {
    for (const k of Object.keys(target))
        delete target[k];
    Object.assign(target, source);
}
function validate(schemas) {
    return (req, _res, next) => {
        if (schemas.body)
            req.body = schemas.body.parse(req.body);
        if (schemas.query) {
            replaceProps(req.query, schemas.query.parse(req.query));
        }
        if (schemas.params) {
            replaceProps(req.params, schemas.params.parse(req.params));
        }
        next();
    };
}
//# sourceMappingURL=validate.js.map