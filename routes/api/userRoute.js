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
      .get(verifyJWT, verifyRoles(ROLES.Admin), getAllUsers);
      
router.delete("/:id", verifyJWT, verifyRoles(ROLES.Admin), handleDeleteAccount);

module.exports = router;
