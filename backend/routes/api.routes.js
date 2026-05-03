import { Router } from "express";
import { createApiController, listApisController } from "../controllers/api.controller.js";
import { Api } from "../models/Api.js";

const router = Router();

router.route("/").get(listApisController).post(createApiController);

export default router;
