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
const upload = require('../../middlewares/fileUpload')
const roles = require('../../config/roles');

router.route("")
.get(getAllOfficials)
.post(verifyJWT, verifyRoles(roles.SuperAdmin), upload.single('image'), postOfficials);

router.put("/bulk-update", verifyJWT, verifyRoles(roles.SuperAdmin), bulkUpdate);

router.route("/:id")
.patch(verifyJWT, verifyRoles(roles.SuperAdmin), upload.single("image"), updateOfficials)
.delete(verifyJWT, verifyRoles(roles.SuperAdmin), deleteOfficials);

module.exports = router;
