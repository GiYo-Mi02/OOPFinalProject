"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.voteRoutes = void 0;
const express_1 = require("express");
const VoteController_1 = require("../controllers/VoteController");
const router = (0, express_1.Router)();
exports.voteRoutes = router;
const controller = new VoteController_1.VoteController();
router.get("/leaderboard/:instituteId", controller.getLeaderboard);
