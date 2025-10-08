const express = require("express");
const {
  getAllOfficials,
  postOfficials,
  updateOfficials,
  deleteOfficials,
} = require("../../controller/officialsController");
const router = express.Router();

router.route("")
.get(getAllOfficials)
.post(postOfficials);

router.route("/:id")
.put(updateOfficials)
.delete(deleteOfficials);

module.exports = router;
