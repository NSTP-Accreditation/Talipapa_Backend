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
  getStaffByFarm,
  getStaffByFarmAndSkill,
  getAgeDistribution,
} = require("../../controller/staffController");


router
  .route("")
  .all(verifyJWT, verifyRoles(roles.Admin))
  .get(getAllStaff)
  .post(postStaff);

router.get('/ageDistribution', getAgeDistribution);

// Get staff by assigned farm id
router
  .route("/farm/:farmId")
  .get(verifyJWT, verifyRoles(roles.Admin), getStaffByFarm);

// Get staff by farm and skill (skill id or skill name)
router
  .route("/farm/:farmId/skill/:skillIdentifier")
  .get(
    verifyJWT,
    verifyRoles(roles.Admin),
    getStaffByFarmAndSkill
  );

router
  .route("/:id")
  .put(verifyJWT, verifyRoles(roles.Admin), updateStaff)
  .delete(verifyJWT, verifyRoles(roles.Admin), deleteStaff);

module.exports = router;
