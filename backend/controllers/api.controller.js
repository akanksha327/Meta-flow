import { createApiForUser, listApisForUser } from "../services/api.service.js";
import { asyncHandler } from "../utils/async-handler.js";

export const createApiController = asyncHandler(async (req, res) => {
  if (!req.user) {
    console.error("User not found in request (auth middleware issue)");
    return res.status(401).json({ success: false, message: "User not authenticated" });
  }

  const userId = req.user._id || req.user.id;
  console.log("Creating API for user:", userId);
  console.log("Payload:", req.body);

  if (!req.body.name || !req.body.baseUrl) {
    return res.status(400).json({ success: false, message: "Name and Base URL are required" });
  }

  const apiRecord = await createApiForUser(userId, req.body);
  res.status(201).json(apiRecord);
});

export const listApisController = asyncHandler(async (req, res) => {
  try {
    const apiRecords = await listApisForUser(req.user.id);
    res.status(200).json(apiRecords);
  } catch (error) {
    console.error("Mongoose error in listApisController:", error.message);
    res.status(200).json([]); // Return empty list instead of 500
  }
});
