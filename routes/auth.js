const express = require("express");
const router = express.Router();
const {
  handleLogin,
  handleCreateAccount,
  handleRefreshToken,
  handleLogout,
} = require("../controller/authController");
const verifyJWT = require("../middlewares/verifyJWT");
const { requireSuperAdmin } = require("../middlewares/checkPermission");
const { testTokenRoute } = require("../utils/jwtDebug");
const {
  loginRateLimiter,
  strictRateLimiter,
  statusCheckLimiter,
} = require("../middlewares/rateLimiter");
const { getIdentifier, getStatus } = require("../utils/lockoutStore");
const { logSecurityEvent } = require("../utils/securityLogger");

// Debug route - REMOVE IN PRODUCTION
router.post("/debug/test-token", testTokenRoute);

// Admin account creation - SuperAdmin only with strict rate limiting
router.post(
  "/signup",
  verifyJWT,
  requireSuperAdmin,
  strictRateLimiter,
  handleCreateAccount
);

// Public routes with rate limiting
router.post("/login", loginRateLimiter, handleLogin);
router.post("/refreshToken", handleRefreshToken);

// Logout - requires authentication
router.post("/logout", verifyJWT, handleLogout);

// Lockout status endpoint for frontend to sync lockout state
router.get(
  "/lockout-status/:username",
  statusCheckLimiter,
  async (req, res) => {
    try {
      const { username } = req.params;

      // Validate username format (alphanumeric, 3-50 chars)
      if (
        !username ||
        username.length < 3 ||
        username.length > 50 ||
        !/^[a-zA-Z0-9_-]+$/.test(username)
      ) {
        return res.status(400).json({
          error: "Invalid username format",
          isLocked: false, // Fail open
        });
      }

      const identifier = getIdentifier(req, username);
      const status = await getStatus(identifier);

      // Log status check for security monitoring
      await logSecurityEvent("PERMISSION_DENIED", req, {
        action: "LOCKOUT_STATUS_CHECK",
        username,
        identifier,
        result: status.isLocked ? "locked" : "available",
      });

      return res.json(status);
    } catch (error) {
      console.error("Failed to get lockout status:", error);

      // Log error event
      try {
        await logSecurityEvent("PERMISSION_DENIED", req, {
          action: "LOCKOUT_STATUS_ERROR",
          error: error.message,
        });
      } catch (logErr) {
        console.error("Failed to log lockout status error:", logErr);
      }

      // Fail open - return unlocked state so frontend can fallback to localStorage
      return res.status(500).json({
        error: "Internal server error",
        isLocked: false,
      });
    }
  }
);

module.exports = router;
