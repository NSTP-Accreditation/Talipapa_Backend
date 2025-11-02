const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  handleDeleteAccount,
  handleUpdateAccount,
} = require("../../controller/userController");
const verifyJWT = require("../../middlewares/verifyJWT");
const verifyRoles = require("../../middlewares/verifyRoles");
const ROLES = require("../../config/roles");

router.route("").get(verifyJWT, verifyRoles(ROLES.SuperAdmin), getAllUsers);

router.delete(
  "/:id",
  verifyJWT,
  verifyRoles(ROLES.SuperAdmin),
  handleDeleteAccount
);

router.put(
  "/:id",
  verifyJWT,
  verifyRoles(ROLES.SuperAdmin),
  handleUpdateAccount
);

module.exports = router;
