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
const { checkPermission } = require("../../middlewares/checkPermission");
const { Permission } = require("../../middlewares/rbac.utils");

// Get all guidelines - PUBLIC (no auth required)
router.get("/", getAllGuideline);

// Create guideline - MANAGE_GUIDELINES permission required
router.post(
  "/",
  verifyJWT,
  checkPermission(Permission.MANAGE_GUIDELINES),
  postGuideline
);

// Get single guideline - PUBLIC (no auth required)
router.get("/:id", getSingleGuideline);

// Update guideline - MANAGE_GUIDELINES permission required
router.put(
  "/:id",
  verifyJWT,
  checkPermission(Permission.MANAGE_GUIDELINES),
  updateGuideline
);

// Delete guideline - MANAGE_GUIDELINES permission required
router.delete(
  "/:id",
  verifyJWT,
  checkPermission(Permission.MANAGE_GUIDELINES),
  deleteGuideline
);

module.exports = router;
