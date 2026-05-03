import { Router } from "express";
import { getBillingController } from "../controllers/billing.controller.js";

const router = Router();

router.get("/", getBillingController);

export default router;
