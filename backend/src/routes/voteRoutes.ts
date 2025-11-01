import { Router } from "express";
import { VoteController } from "../controllers/VoteController";
import { authenticate } from "../middleware/authenticate";

const router = Router();
const controller = new VoteController();

router.get("/leaderboard/:instituteId", controller.getLeaderboard);
router.get("/elections/active", authenticate, controller.getActiveElections);
router.get("/elections/:electionId/candidates", controller.getElectionCandidates);
router.post("/cast", authenticate, controller.castVote);
router.get("/check/:electionId", authenticate, controller.checkVoteStatus);

export { router as voteRoutes };
