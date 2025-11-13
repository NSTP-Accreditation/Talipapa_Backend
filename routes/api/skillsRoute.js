const express = require("express");
const {
  getAllSkills,
  postSkills,
  updateSkills,
  deleteSkills,
  postManySkills,
} = require("../../controller/skillsController");

const router = express.Router();
const verifyJWT = require("../../middlewares/verifyJWT");
const { checkPermission } = require("../../middlewares/checkPermission");
const { Permission } = require("../../middlewares/rbac.utils");

// Get all skills - VIEW_TRADING permission required (Skills are part of Trading section)
router.get(
  "/",
  verifyJWT,
  checkPermission(Permission.VIEW_TRADING),
  getAllSkills
);

// Create skill - MANAGE_TRADING permission required
router.post(
  "/",
  verifyJWT,
  checkPermission(Permission.MANAGE_TRADING),
  postSkills
);

// Create multiple skills - MANAGE_TRADING permission required
router.post(
  "/many",
  verifyJWT,
  checkPermission(Permission.MANAGE_TRADING),
  postManySkills
);

// Update skill - MANAGE_TRADING permission required
router.put(
  "/:id",
  verifyJWT,
  checkPermission(Permission.MANAGE_TRADING),
  updateSkills
);

// Delete skill - MANAGE_TRADING permission required
router.delete(
  "/:id",
  verifyJWT,
  checkPermission(Permission.MANAGE_TRADING),
  deleteSkills
);

module.exports = router;
