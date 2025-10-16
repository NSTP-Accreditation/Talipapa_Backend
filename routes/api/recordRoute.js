const express = require("express");
const router = express.Router();
const {
  getRecords,
  createRecord,
  updateRecord,
  getSingleRecord,
  searchRecords,
} = require("../../controller/recordController");
const verifyJWT = require("../../middlewares/verifyJWT");
const verifyRoles = require("../../middlewares/verifyRoles");
const roles = require("../../config/roles");

router.get(
  "/search",
  verifyJWT,
  verifyRoles(roles.Admin),
  searchRecords
);

router
  .route("/")
  .all(verifyJWT, verifyRoles(roles.Admin))
  .get(getRecords)
  .post(createRecord);

router.patch(
  "/:record_id",
  verifyJWT,
  verifyRoles(roles.Admin),
  updateRecord
);
router.get(
  "/:record_id",
  verifyJWT,
  verifyRoles(roles.Admin),
  getSingleRecord
);

module.exports = router;
