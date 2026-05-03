import express from "express";
import { getUsageController } from "../controllers/usage.controller.js";
import { authMiddleware } from "../middleware/auth-middleware.js";

const router = express.Router();

router.use(authMiddleware);
router.get("/", getUsageController);

export default router;
