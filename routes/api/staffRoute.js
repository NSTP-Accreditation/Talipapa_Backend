const express = require("express");
const router = express.Router();
const verifyJWT = require("../../middlewares/verifyJWT");
const verifyRoles = require("../../middlewares/verifyRoles");
const roles = require("../../config/roles");

const {
  getAllStaff,
  postStaff,
  updateStaff,
  deleteStaff,
} = require("../../controller/staffController");

const { getStaffByFarm, getStaffByFarmAndSkill } = require("../../controller/staffController");

router
  .route("")
  .all(verifyJWT, verifyRoles(roles.SuperAdmin, roles.Admin))
  .get(getAllStaff)
  .post(postStaff);

// Get staff by assigned farm id
router.route("/farm/:farmId").get(verifyJWT, verifyRoles(roles.SuperAdmin, roles.Admin), getStaffByFarm);

// Get staff by farm and skill (skill id or skill name)
router.route("/farm/:farmId/skill/:skillIdentifier").get(verifyJWT, verifyRoles(roles.SuperAdmin, roles.Admin), getStaffByFarmAndSkill);

router
  .route(":id")
  .put(verifyJWT, verifyRoles(roles.SuperAdmin, roles.Admin), updateStaff)
  .delete(verifyJWT, verifyRoles(roles.SuperAdmin, roles.Admin), deleteStaff);

module.exports = router;
