import express from "express";
import { createApiKey, getKeys } from "../controllers/apiKey.controller.js";
import { authMiddleware } from "../middleware/auth-middleware.js";

const router = express.Router();

// Making it protected so only the user can manage their keys
router.use(authMiddleware);

router.post("/", createApiKey);
router.get("/", getKeys); // Support query params like /api/keys?apiId=...

export default router;
