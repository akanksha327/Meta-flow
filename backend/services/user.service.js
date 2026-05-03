import { User } from "../models/index.js";

export async function syncUserFromFirebaseIdentity(identity = {}) {
  const userEmail = identity.email || "test@example.com";
  const userName = identity.displayName || identity.name || "Test User";

  try {
    const user = await User.findOneAndUpdate(
      { email: userEmail },
      { name: userName },
      { upsert: true, new: true }
    );
    return user;
  } catch (err) {
    console.error("Mongoose error in syncUserFromFirebaseIdentity:", err);
    throw err;
  }
}
