const express = require("express");
const router = express.Router();
const verifyJWT = require("../../middlewares/verifyJWT");
const { checkPermission } = require("../../middlewares/checkPermission");
const { Permission } = require("../../middlewares/rbac.utils");

const {
  getAllStaff,
  postStaff,
  updateStaff,
  deleteStaff,
  getStaffByFarm,
  getStaffByFarmAndSkill,
  getAgeDistribution,
} = require("../../controller/staffController");

// Get all staff - VIEW_USERS permission required
router.get("/", verifyJWT, checkPermission(Permission.VIEW_USERS), getAllStaff);

// Create staff - CREATE_USERS permission required
router.post(
  "/",
  verifyJWT,
  checkPermission(Permission.CREATE_USERS),
  postStaff
);

// Get age distribution - VIEW_USERS permission required
router.get(
  "/ageDistribution",
  verifyJWT,
  checkPermission(Permission.VIEW_USERS),
  getAgeDistribution
);

// Get staff by farm - VIEW_USERS permission required
router.get(
  "/farm/:farmId",
  verifyJWT,
  checkPermission(Permission.VIEW_USERS),
  getStaffByFarm
);

// Get staff by farm and skill - VIEW_USERS permission required
router.get(
  "/farm/:farmId/skill/:skillIdentifier",
  verifyJWT,
  checkPermission(Permission.VIEW_USERS),
  getStaffByFarmAndSkill
);

// Update staff - EDIT_USERS permission required
router.put(
  "/:id",
  verifyJWT,
  checkPermission(Permission.EDIT_USERS),
  updateStaff
);

// Delete staff - DELETE_USERS permission required
router.delete(
  "/:id",
  verifyJWT,
  checkPermission(Permission.DELETE_USERS),
  deleteStaff
);

module.exports = router;
