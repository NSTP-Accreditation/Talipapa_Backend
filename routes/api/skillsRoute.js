const express = require("express");
const {
  getAllSkills,
  postSkills,
  updateSkills,
  deleteSkills,
  postManySkills,
} = require("../../controller/skillsController");

const router = express.Router();
const verifyJWT = require('../../middlewares/verifyJWT');
const { checkPermission } = require('../../middlewares/checkPermission');
const { Permission } = require('../../middlewares/rbac.utils');

// Get all skills - VIEW_CONTENT permission required
router.get(
  "/",
  verifyJWT,
  checkPermission(Permission.VIEW_CONTENT),
  getAllSkills
);

// Create skill - EDIT_CONTENT permission required
router.post(
  "/",
  verifyJWT,
  checkPermission(Permission.EDIT_CONTENT),
  postSkills
);

// Create multiple skills - EDIT_CONTENT permission required
router.post(
  "/many",
  verifyJWT,
  checkPermission(Permission.EDIT_CONTENT),
  postManySkills
);

// Update skill - EDIT_CONTENT permission required
router.put(
  "/:id",
  verifyJWT,
  checkPermission(Permission.EDIT_CONTENT),
  updateSkills
);

// Delete skill - DELETE_CONTENT permission required
router.delete(
  "/:id",
  verifyJWT,
  checkPermission(Permission.DELETE_CONTENT),
  deleteSkills
);

module.exports = router;
