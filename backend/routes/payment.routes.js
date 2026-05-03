import express from "express";
import {
  createOrderController,
  verifyPaymentController,
  getPaymentHistoryController,
} from "../controllers/payment.controller.js";
import { authMiddleware } from "../middleware/auth-middleware.js";

const router = express.Router();

// Re-enabling auth for security and correct user-payment linking
router.use(authMiddleware);

router.post("/create-order", createOrderController);
router.post("/verify", verifyPaymentController);
router.get("/history", getPaymentHistoryController);

export default router;
