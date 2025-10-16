const express = require("express");
const router = express.Router();
const { getAllAchievements, postAchievements, updateAchievements, deleteAchievements } = require("../../controller/achievementsController");
const verifyJWT = require("../../middlewares/verifyJWT");
const verifyRoles = require("../../middlewares/verifyRoles");
const roles = require("../../config/roles");
const upload = require('../../middlewares/fileUpload');

router
    .route("")
    .get(getAllAchievements)
    .post(verifyJWT, verifyRoles(roles.Admin), upload.single('image'), postAchievements);

router
  .route("/:id")
  .patch(verifyJWT, verifyRoles(roles.Admin), upload.single('image'), updateAchievements)
  .delete(verifyJWT, verifyRoles(roles.Admin), deleteAchievements);

module.exports = router;