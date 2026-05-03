import { syncUserFromFirebaseIdentity } from "../services/user.service.js";
import { asyncHandler } from "../utils/async-handler.js";

export const syncUserController = asyncHandler(async (req, res) => {
  const user = await syncUserFromFirebaseIdentity(req.auth);
  res.status(200).json(user);
});
