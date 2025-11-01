import { Router } from "express";
import { AdminController } from "../controllers/AdminController";
import { authenticate } from "../middleware/authenticate";

const router = Router();
const controller = new AdminController();

// All admin routes require authentication
router.use(authenticate);

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

export { router as adminRoutes };
