const express = require("express");
const router = express.Router();
const {
  getRecords,
  createRecord,
  updateRecord,
  getSingleRecord,
  searchRecords,
  deleteRecord,
} = require("../../controller/recordController");
const verifyJWT = require("../../middlewares/verifyJWT");
const verifyRoles = require("../../middlewares/verifyRoles");
const roles = require("../../config/roles");

router.get(
  "/search",
  verifyJWT,
  verifyRoles(roles.SuperAdmin),
  searchRecords
);

router
  .route("/")
  .all(verifyJWT, verifyRoles(roles.SuperAdmin))
  .get(getRecords)
  .post(createRecord);

router.route("/:record_id")
  .get(getSingleRecord)
  .patch(verifyJWT, verifyRoles(roles.SuperAdmin), updateRecord)
  .delete(verifyJWT, verifyRoles(roles.SuperAdmin), deleteRecord)

module.exports = router;
