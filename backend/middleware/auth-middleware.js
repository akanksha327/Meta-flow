import { getFirebaseAdminAuth } from "../config/firebase.js";
import { syncUserFromFirebaseIdentity } from "../services/user.service.js";
import { AppError } from "../utils/app-error.js";

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith("Bearer ")) {
      // In development, we might want to fallback if NO header is present,
      // but for production/security we should enforce it.
      // We will allow a "test-token" for local dev convenience if needed,
      // but let's implement real verification first.
      throw new AppError("No authentication token provided.", 401);
    }

    const token = authHeader.split("Bearer ")[1];
    const adminAuth = getFirebaseAdminAuth();
    
    // Verify the Firebase ID Token
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Sync/Get user from our database
    const user = await syncUserFromFirebaseIdentity(decodedToken);
    
    // Attach user and auth info to request
    req.auth = decodedToken;
    req.user = user;
    
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    
    if (error.code?.startsWith("auth/")) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "Invalid or expired session. Please log in again." 
      });
    }
    
    res.status(error.statusCode || 401).json({ 
      error: "Authentication failed", 
      message: error.message 
    });
  }
}
