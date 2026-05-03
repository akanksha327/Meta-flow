import { Router } from "express";
import { authMiddleware } from "../middleware/auth-middleware.js";
import apiRoutes from "./api.routes.js";
import apiKeyRoutes from "./api-key.routes.js";
import billingRoutes from "./billing.routes.js";
import usageRoutes from "./usage.routes.js";
import userRoutes from "./user.routes.js";

const router = Router();

router.use(authMiddleware);
router.use("/users", userRoutes);
router.use("/apis", apiRoutes);
router.use("/keys", apiKeyRoutes);
router.use("/usage", usageRoutes);
router.use("/billing", billingRoutes);

export default router;
