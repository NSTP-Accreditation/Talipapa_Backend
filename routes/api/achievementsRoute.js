const express = require("express");
const router = express.Router();
const {
  getAllAchievements,
  postAchievements,
  updateAchievements,
  deleteAchievements,
} = require("../../controller/achievementsController");
const verifyJWT = require("../../middlewares/verifyJWT");
const { checkPermission } = require("../../middlewares/checkPermission");
const { Permission } = require("../../middlewares/rbac.utils");
const upload = require("../../middlewares/fileUpload");

// Get all achievements - VIEW_ACHIEVEMENTS permission required
router.get(
  "/",
  verifyJWT,
  checkPermission(Permission.VIEW_ACHIEVEMENTS),
  getAllAchievements
);

// Create achievement - MANAGE_ACHIEVEMENTS permission required
router.post(
  "/",
  verifyJWT,
  checkPermission(Permission.MANAGE_ACHIEVEMENTS),
  upload.single("image"),
  postAchievements
);

// Update achievement - MANAGE_ACHIEVEMENTS permission required
router.patch(
  "/:id",
  verifyJWT,
  checkPermission(Permission.MANAGE_ACHIEVEMENTS),
  upload.single("image"),
  updateAchievements
);

// Delete achievement - MANAGE_ACHIEVEMENTS permission required
router.delete(
  "/:id",
  verifyJWT,
  checkPermission(Permission.MANAGE_ACHIEVEMENTS),
  deleteAchievements
);

module.exports = router;
