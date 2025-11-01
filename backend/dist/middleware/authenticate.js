"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function authenticate(req, res, next) {
    const header = req.header("authorization");
    if (!header || typeof header !== "string" || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authorization token missing" });
    }
    const token = header.slice("Bearer ".length).trim();
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.APP_JWT_SECRET);
        const claims = {
            sub: String(decoded.sub ?? decoded.id ?? ""),
            email: String(decoded.email ?? ""),
            role: decoded.role ?? "student",
            instituteId: decoded.instituteId ?? null,
        };
        if (!claims.sub || !claims.email) {
            return res.status(401).json({ message: "Invalid authorization token" });
        }
        req.auth = claims;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}
