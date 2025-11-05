const express = require("express");
const router = express.Router();
const verifyJWT = require("../../middlewares/verifyJWT");
const { checkPermission } = require("../../middlewares/checkPermission");
const { Permission } = require("../../middlewares/rbac.utils");

const {
  getAllProgram,
  postProgram,
  editProgram,
  deleteProgram,
  postProgramItem,
  deleteProgramItem,
  getProgramByTitle,
} = require("../../controller/talipapanatinController");

// Get all programs - VIEW_CONTENT permission required
router.get(
  "/",
  verifyJWT,
  checkPermission(Permission.VIEW_CONTENT),
  getAllProgram
);

// Create program - EDIT_CONTENT permission required
router.post(
  "/",
  verifyJWT,
  checkPermission(Permission.EDIT_CONTENT),
  postProgram
);

// Update program - EDIT_CONTENT permission required
router.put(
  "/:id",
  verifyJWT,
  checkPermission(Permission.EDIT_CONTENT),
  editProgram
);

// Delete program - DELETE_CONTENT permission required
router.delete(
  "/:id",
  verifyJWT,
  checkPermission(Permission.DELETE_CONTENT),
  deleteProgram
);

// Add program item - EDIT_CONTENT permission required
router.post(
  "/:id/items",
  verifyJWT,
  checkPermission(Permission.EDIT_CONTENT),
  postProgramItem
);

// Delete program item - DELETE_CONTENT permission required
router.delete(
  "/:id/items/:itemId",
  verifyJWT,
  checkPermission(Permission.DELETE_CONTENT),
  deleteProgramItem
);

// Get program by title - VIEW_CONTENT permission required
router.get(
  "/title/:title",
  verifyJWT,
  checkPermission(Permission.VIEW_CONTENT),
  getProgramByTitle
);

module.exports = router;
