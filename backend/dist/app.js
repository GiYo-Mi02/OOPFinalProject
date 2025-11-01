"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const authRoutes_1 = require("./routes/authRoutes");
const voteRoutes_1 = require("./routes/voteRoutes");
const adminRoutes_1 = require("./routes/adminRoutes");
const authenticate_1 = require("./middleware/authenticate");
const app = (0, express_1.default)();
exports.app = app;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)("dev"));
app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});
app.use("/api/auth", authRoutes_1.authRoutes);
app.use("/api/votes", authenticate_1.authenticate, voteRoutes_1.voteRoutes);
app.use("/api/admin", authenticate_1.authenticate, adminRoutes_1.adminRoutes);
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: "Unexpected server error" });
});
