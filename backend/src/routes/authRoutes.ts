import { Router } from "express";
import { AuthController } from "../controllers/AuthController";

const router = Router();
const controller = new AuthController();

router.post("/otp", controller.requestOtp);
router.post("/otp/verify", controller.verifyOtp);

export { router as authRoutes };
