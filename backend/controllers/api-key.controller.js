import {
  createApiKeyForUser,
  listApiKeysForUser,
  revokeApiKeyForUser,
} from "../services/api-key.service.js";
import { asyncHandler } from "../utils/async-handler.js";

export const createApiKeyController = asyncHandler(async (req, res) => {
  const apiKey = await createApiKeyForUser(req.user.id, req.body);
  res.status(201).json(apiKey);
});

export const listApiKeysController = asyncHandler(async (req, res) => {
  try {
    const apiKeys = await listApiKeysForUser(req.user.id, req.query);
    res.status(200).json(apiKeys);
  } catch (error) {
    console.error("Mongoose error in listApiKeysController:", error.message);
    res.status(200).json([]); // Return empty list instead of 500
  }
});

export const revokeApiKeyController = asyncHandler(async (req, res) => {
  const apiKey = await revokeApiKeyForUser(req.user.id, req.params.id);
  res.status(200).json(apiKey);
});
