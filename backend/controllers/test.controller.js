import mongoose from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";

export const testDatabaseController = asyncHandler(async (_req, res) => {
  // For MongoDB health check
  if (mongoose.connection.readyState !== 1) {
    throw new Error("Database not connected");
  }

  res.status(200).json({
    success: true,
    message: "Database connection is healthy (Mongoose).",
  });
});
