"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoutes = void 0;
const express_1 = require("express");
const AdminController_1 = require("../controllers/AdminController");
const authenticate_1 = require("../middleware/authenticate");
const router = (0, express_1.Router)();
exports.adminRoutes = router;
const controller = new AdminController_1.AdminController();
// All admin routes require authentication
router.use(authenticate_1.authenticate);
// Elections
router.get("/elections", controller.getElections);
router.post("/elections", controller.createElection);
router.put("/elections/:id", controller.updateElection);
router.delete("/elections/:id", controller.deleteElection);
// Candidates
router.get("/candidates", controller.getCandidates);
router.get("/elections/:electionId/positions", controller.getPositionsByElection);
router.post("/positions", controller.createPosition);
router.post("/candidates", controller.createCandidate);
router.put("/candidates/:id", controller.updateCandidate);
router.delete("/candidates/:id", controller.deleteCandidate);
// Analytics
router.get("/analytics", controller.getAnalytics);
