const express = require("express");
const router = express.Router();
const { getAllAchievements, postAchievements, updateAchievements, deleteAchievements } = require("../../controller/achievementsController");

router
    .route("")
    .get(getAllAchievements)
    .post(postAchievements);

router
  .route("/:id")
  .put(updateAchievements)
  .delete(deleteAchievements);

module.exports = router;