const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  handleDeleteAccount
} = require("../../controller/userController");
const verifyJWT = require('../../middlewares/verifyJWT');
const verifyRoles = require('../../middlewares/verifyRoles');
const ROLES = require('../../config/roles');

router.route("")
      .get(verifyJWT, verifyRoles(ROLES.SuperAdmin), getAllUsers);
      
router.delete("/:id", verifyJWT, verifyRoles(ROLES.SuperAdmin), handleDeleteAccount);

module.exports = router;
