import { Router } from "express";
import * as controller from "../controllers/UserController";
import { authenticate } from "../middleware/authenticate";

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Update user's institute
router.patch("/institute", controller.updateInstitute);

export { router as userRoutes };
