import { Router } from "express";
import { createApiController, listApisController } from "../controllers/api.controller.js";

const router = Router();

router.route("/").get(listApisController).post(createApiController);

export default router;
