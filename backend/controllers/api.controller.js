import { createApiForUser, listApisForUser } from "../services/api.service.js";
import { asyncHandler } from "../utils/async-handler.js";

export const createApiController = asyncHandler(async (req, res) => {
  const apiRecord = await createApiForUser(req.user.id, req.body);
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
