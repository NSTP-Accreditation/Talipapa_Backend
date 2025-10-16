const express = require("express");
const {
  getAllOfficials,
  postOfficials,
  updateOfficials,
  deleteOfficials,
  bulkUpdate,
} = require("../../controller/officialsController");

const router = express.Router();
const verifyJWT = require('../../middlewares/verifyJWT')
const verifyRoles = require('../../middlewares/verifyRoles')
const roles = require('../../config/roles');

router.route("")
.get(getAllOfficials)
.post(verifyJWT, verifyRoles(roles.Admin), postOfficials);

router.put("/bulk-update", verifyJWT, verifyRoles(roles.Admin), bulkUpdate);

router.route("/:id")
.put(verifyJWT, verifyRoles(roles.Admin), updateOfficials)
.delete(verifyJWT, verifyRoles(roles.Admin), deleteOfficials);

module.exports = router;
