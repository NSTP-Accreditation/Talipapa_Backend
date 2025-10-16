const express = require("express");
const { getAllNews, postNews, updateNews, deleteNews } = require("../../controller/newsController");
const router = express.Router();
const verifyJWT = require("../../middlewares/verifyJWT");
const verifyRoles = require("../../middlewares/verifyRoles");
const roles = require("../../config/roles");

router
  .route("")
  .get(getAllNews)
  .post(verifyJWT, verifyRoles(roles.Admin), postNews)

router
  .route("/:id")
  .put(verifyJWT, verifyRoles(roles.Admin), updateNews)
  .delete(verifyJWT, verifyRoles(roles.Admin), deleteNews);

module.exports = router;
