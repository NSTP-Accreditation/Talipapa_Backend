const express = require("express");
const router = express.Router();
const {
  getRecords,
  createRecord,
  updateRecord,
  getSingleRecord,
  findRecordByLastName,
  searchRecords,
  deleteRecord,
} = require("../../controller/recordController");
const verifyJWT = require("../../middlewares/verifyJWT");
const { checkPermission } = require("../../middlewares/checkPermission");
const { Permission } = require("../../middlewares/rbac.utils");

// Search records - VIEW_RECORDS permission required
router.get(
  "/search",
  verifyJWT,
  checkPermission(Permission.VIEW_RECORDS),
  searchRecords
);

// Get all records - VIEW_RECORDS permission required
router.get(
  "/",
  verifyJWT,
  checkPermission(Permission.VIEW_RECORDS),
  getRecords
);

// Create record - CREATE_RECORDS permission required
router.post(
  "/",
  verifyJWT,
  checkPermission(Permission.CREATE_RECORDS),
  createRecord
);

// NEW ROUTES: Find record by lastName with optional record_id
// These routes should come before /:record_id to handle the new search pattern
// Route 1: With record_id
router.get(
  "/find/:record_id",
  verifyJWT,
  checkPermission(Permission.VIEW_RECORDS),
  findRecordByLastName
);

// Route 2: Without record_id (lastName only in query params)
router.get(
  "/find",
  verifyJWT,
  checkPermission(Permission.VIEW_RECORDS),
  findRecordByLastName
);

// Get single record - VIEW_RECORDS permission required
router.get(
  "/:record_id",
  verifyJWT,
  checkPermission(Permission.VIEW_RECORDS),
  getSingleRecord
);

// Update record - EDIT_RECORDS permission required
router.patch(
  "/:record_id",
  verifyJWT,
  checkPermission(Permission.EDIT_RECORDS),
  updateRecord
);

// Delete record - DELETE_RECORDS permission required
router.delete(
  "/:record_id",
  verifyJWT,
  checkPermission(Permission.DELETE_RECORDS),
  deleteRecord
);

module.exports = router;
