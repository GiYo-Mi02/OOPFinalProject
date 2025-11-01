import { Router } from "express";
import * as controller from "../controllers/InstituteController";

const router = Router();

router.get("/", controller.getInstitutes);

export { router as instituteRoutes };
