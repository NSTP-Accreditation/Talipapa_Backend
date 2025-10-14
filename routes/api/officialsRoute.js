const express = require("express");
const {
  getAllOfficials,
  postOfficials,
  updateOfficials,
  deleteOfficials,
} = require("../../controller/officialsController");

const router = express.Router();
const verifyJWT = require('../../middlewares/verifyJWT')
const verifyRoles = require('../../middlewares/verifyRoles')
const roles = require('../../config/roles');

router.route("")
.get(getAllOfficials)
.post(verifyJWT, verifyRoles(roles.SuperAdmin, roles.Admin), postOfficials);

router.route("/:id")
.put(verifyJWT, verifyRoles(roles.SuperAdmin, roles.Admin), updateOfficials)
.delete(verifyJWT, verifyRoles(roles.SuperAdmin, roles.Admin), deleteOfficials);

module.exports = router;
