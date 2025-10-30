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
const upload = require('../../middlewares/fileUpload');
const roles = require("../../config/roles");

router.get("/", getMaterials);

router
  .route("/")
  .all(verifyJWT, verifyRoles(roles.SuperAdmin))
  .post(upload.single('image'), createMaterial)
  .delete(deleteAllMaterial);

router
  .route("/:id")
  .all(verifyJWT, verifyRoles(roles.SuperAdmin))
  .put(upload.single('image'), updateMaterial)
  .patch(upload.single('image'), updateMaterial)
  .delete(deleteMaterial);


module.exports = router;
