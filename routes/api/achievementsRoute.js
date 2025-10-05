const express = require("express");
const router = express.Router();
const { getAllAchievements, postAchievements, updateAchievements, deleteAchievements } = require("../../controller/achievementsController");
const verifyJWT = require("../../middlewares/verifyJWT");
const verifyRoles = require("../../middlewares/verifyRoles");
const roles = require("../../config/roles");

router
    .route("")
    .get(getAllAchievements)
    .post(verifyJWT, verifyRoles(roles.SuperAdmin, roles.Admin), postAchievements);

router
  .route("/:id")
  .put(verifyJWT, verifyRoles(roles.SuperAdmin, roles.Admin), updateAchievements)
  .delete(verifyJWT, verifyRoles(roles.SuperAdmin, roles.Admin), deleteAchievements);

module.exports = router;