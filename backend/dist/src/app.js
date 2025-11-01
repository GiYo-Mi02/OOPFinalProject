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
const instituteRoutes_1 = require("./routes/instituteRoutes");
const userRoutes_1 = require("./routes/userRoutes");
const authenticate_1 = require("./middleware/authenticate");
const app = (0, express_1.default)();
exports.app = app;
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '50mb' })); // Increased limit for image uploads
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
app.use((0, morgan_1.default)("dev"));
app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});
app.use("/api/auth", authRoutes_1.authRoutes);
app.use("/api/votes", authenticate_1.authenticate, voteRoutes_1.voteRoutes);
app.use("/api/admin", authenticate_1.authenticate, adminRoutes_1.adminRoutes);
app.use("/api/institutes", instituteRoutes_1.instituteRoutes);
app.use("/api/user", userRoutes_1.userRoutes);
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: "Unexpected server error" });
});
