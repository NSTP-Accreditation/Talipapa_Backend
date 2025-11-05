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

// Admin account creation - SuperAdmin only
router.post("/signup", verifyJWT, requireSuperAdmin, handleCreateAccount);

// Public routes
router.post("/login", handleLogin);
router.post("/refreshToken", handleRefreshToken);

// Logout - requires authentication
router.post("/logout", verifyJWT, handleLogout);

module.exports = router;
