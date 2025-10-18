const express = require("express");
const router = express.Router();
const {
  getAllGuideline,
  postGuideline,
  updateGuideline,
  deleteGuideline,
  getSingleGuideline,
} = require("../../controller/guidelinesController");
const verifyJWT = require("../../middlewares/verifyJWT");
const verifyRoles = require("../../middlewares/verifyRoles");
const roles = require("../../config/roles");

// GET all guidelines
// CREATE a new guideline
router
  .route("")
  .get(getAllGuideline)
  .post(verifyJWT, verifyRoles(roles.Admin), postGuideline);

router
  .route("/:id")
  .get(getSingleGuideline)
  .put(verifyJWT, verifyRoles(roles.Admin), updateGuideline)
  .delete(verifyJWT, verifyRoles(roles.Admin), deleteGuideline);

module.exports = router;
