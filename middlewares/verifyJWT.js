const jwt = require("jsonwebtoken");
const User = require("../model/User");

/**
 * Middleware to verify JWT token and attach full user object to request
 * The user object includes roles which are needed for RBAC permission checks
 */
const verifyJWT = async (request, response, next) => {
  try {
    const authHeader =
      request.headers.Authorization || request.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return response.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const token = authHeader.split(" ")[1];

    // Check if token is empty or undefined
    if (!token || token === "undefined" || token === "null") {
      console.warn("[Auth] Empty or invalid token received");
      return response.status(401).json({
        success: false,
        message: "Access token is missing or invalid",
      });
    }

    // Verify token
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      async (error, decoded) => {
        if (error) {
          // More detailed error logging
          console.error("[Auth] JWT verification failed:", {
            error: error.message,
            tokenPreview: token?.substring(0, 20) + "...",
            endpoint: request.path,
            method: request.method,
          });
          return response.status(403).json({
            success: false,
            message: "Invalid or expired token",
          });
        }

        // Fetch full user from database (includes roles)
        const user = await User.findById(decoded.userInfo._id).select(
          "-password"
        );

        if (!user) {
          return response.status(401).json({
            success: false,
            message: "User not found",
          });
        }

        // Attach full user object to request (needed for RBAC)
        request.user = user;

        // Also keep legacy properties for backward compatibility
        request.userId = decoded.userInfo._id;
        request.username = decoded.userInfo.username;
        request.roles = decoded.userInfo.roles;

        next();
      }
    );
  } catch (error) {
    console.error("[Auth] Error in verifyJWT middleware:", error);
    return response.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};

module.exports = verifyJWT;
