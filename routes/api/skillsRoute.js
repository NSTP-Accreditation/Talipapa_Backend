const express = require("express");
const {
  getAllSkills,
  postSkills,
  updateSkills,
  deleteSkills,
  postManySkills,
} = require("../../controller/skillsController");

const router = express.Router();
const verifyJWT = require('../../middlewares/verifyJWT')
const verifyRoles = require('../../middlewares/verifyRoles')
const roles = require('../../config/roles');

router.route("")
.get(getAllSkills)
.post(verifyJWT, verifyRoles(roles.SuperAdmin), postSkills);

// POST multiple skills at once. Body should be an array of skill objects or { skills: [...] }
router.route("/many").post(verifyJWT, verifyRoles(roles.SuperAdmin), postManySkills);

router.route("/:id")
.put(verifyJWT, verifyRoles(roles.SuperAdmin), updateSkills)
.delete(verifyJWT, verifyRoles(roles.SuperAdmin), deleteSkills);

module.exports = router;
