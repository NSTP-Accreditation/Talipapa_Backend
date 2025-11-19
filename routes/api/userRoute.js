const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  handleDeleteAccount,
  handleUpdateAccount,
} = require("../../controller/userController");
const verifyJWT = require("../../middlewares/verifyJWT");
const { checkPermission } = require("../../middlewares/checkPermission");
const { Permission } = require("../../middlewares/rbac.utils");

// Get all users - VIEW_USERS permission required
router.get("/", verifyJWT, checkPermission(Permission.VIEW_USERS), getAllUsers);

// Delete user - DELETE_USERS permission required
router.delete(
  "/:id",
  verifyJWT,
  checkPermission(Permission.DELETE_USERS),
  handleDeleteAccount
);

// Update user - EDIT_USERS permission required
router.put(
  "/:id",
  verifyJWT,
  checkPermission(Permission.EDIT_USERS),
  handleUpdateAccount
);

module.exports = router;
