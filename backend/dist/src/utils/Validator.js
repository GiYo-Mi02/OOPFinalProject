"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validator = void 0;
class Validator {
    static parse(schema, payload) {
        return schema.parse(payload);
    }
}
exports.Validator = Validator;
