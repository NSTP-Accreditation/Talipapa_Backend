const express = require("express");
const router = express.Router();
const {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  deleteAllMaterial,
} = require("../../controller/materialController");
const verifyJWT = require("../../middlewares/verifyJWT");
const verifyRoles = require("../../middlewares/verifyRoles");
// const upload = require('../../middleware/upload');
const roles = require("../../config/roles");

router.get("/", getMaterials);

router
  .route("/")
  .all(verifyJWT, verifyRoles(roles.SuperAdmin))
  .post(createMaterial)
  .delete(deleteAllMaterial);

router
  .route("/:id")
  .all(verifyJWT, verifyRoles(roles.SuperAdmin))
  .patch(updateMaterial)
  .delete(deleteMaterial);


module.exports = router;
