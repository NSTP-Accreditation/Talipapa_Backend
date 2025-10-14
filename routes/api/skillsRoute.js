const express = require("express");
const {
  getAllSkills,
  postSkills,
  updateSkills,
  deleteSkills,
} = require("../../controller/skillsController");

const router = express.Router();
const verifyJWT = require('../../middlewares/verifyJWT')
const verifyRoles = require('../../middlewares/verifyRoles')
const roles = require('../../config/roles');

router.route("")
.get(getAllSkills)
.post(verifyJWT, verifyRoles(roles.SuperAdmin, roles.Admin), postSkills);

router.route("/:id")
.put(verifyJWT, verifyRoles(roles.SuperAdmin, roles.Admin), updateSkills)
.delete(verifyJWT, verifyRoles(roles.SuperAdmin, roles.Admin), deleteSkills);

module.exports = router;
