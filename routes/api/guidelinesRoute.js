const express = require("express");
const router = express.Router();
const { getAllGuideline, postGuideline, updateGuideline, deleteGuideline } = require("../../controller/guidelinesController");
const verifyJWT = require("../../middlewares/verifyJWT");
const verifyRoles = require("../../middlewares/verifyRoles");
const roles = require("../../config/roles");

// GET all guidelines
// CREATE a new guideline
router
  .route("")
  // GET all
  .get(getAllGuideline)

  // POST new guideline
  .post(verifyJWT, verifyRoles(roles.Admin), postGuideline);

// UPDATE a guideline
// DELETE a guideline
router
  .route("/:id")
  // PUT update
  .put(verifyJWT, verifyRoles(roles.Admin), updateGuideline)

  // DELETE guideline
  .delete(verifyJWT, verifyRoles(roles.Admin), deleteGuideline);

module.exports = router;
