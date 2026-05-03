import { Router } from "express";
import { gatewayController } from "../controllers/gateway.controller.js";

const router = Router();

router.all("/:apiId", gatewayController);
router.all("/:apiId/*proxyPath", gatewayController);

export default router;
