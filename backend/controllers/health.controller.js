import mongoose from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";

/**
 * @desc    Health check endpoint
 * @route   GET /health
 * @access  Public
 */
export const healthCheck = asyncHandler(async (_req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  
  const healthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: dbStatus,
    },
    message: "MeterFlow backend is running smoothly.",
  };

  if (dbStatus !== "connected") {
    healthStatus.status = "degraded";
    return res.status(503).json(healthStatus);
  }

  res.status(200).json(healthStatus);
});
