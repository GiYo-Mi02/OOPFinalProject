"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoutes = void 0;
const express_1 = require("express");
const AdminController_1 = require("../controllers/AdminController");
const router = (0, express_1.Router)();
exports.adminRoutes = router;
const controller = new AdminController_1.AdminController();
router.post("/elections", controller.createElection);
