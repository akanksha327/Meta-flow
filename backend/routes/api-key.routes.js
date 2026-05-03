import { Router } from "express";
import {
  createApiKeyController,
  listApiKeysController,
  revokeApiKeyController,
} from "../controllers/api-key.controller.js";

const router = Router();

router.route("/").get(listApiKeysController).post(createApiKeyController);
router.delete("/:id", revokeApiKeyController);

export default router;
