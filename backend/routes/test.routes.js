import { Router } from "express";
import { testDatabaseController } from "../controllers/test.controller.js";

const router = Router();

router.get("/", testDatabaseController);

export default router;
