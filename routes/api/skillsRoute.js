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
.post(verifyJWT, verifyRoles(roles.Admin), postSkills);

// POST multiple skills at once. Body should be an array of skill objects or { skills: [...] }
router.route("/many").post(verifyJWT, verifyRoles(roles.Admin), postManySkills);

router.route("/:id")
.put(verifyJWT, verifyRoles(roles.Admin), updateSkills)
.delete(verifyJWT, verifyRoles(roles.Admin), deleteSkills);

module.exports = router;
