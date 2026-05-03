import { Router } from "express";
import { syncUserController } from "../controllers/user.controller.js";

const router = Router();

router.post("/sync", syncUserController);

export default router;
