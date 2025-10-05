const express = require("express");
const { getAllNews, postNews, updateNews, deleteNews } = require("../../controller/newsController");
const router = express.Router();

router
  .route("")
  .get(getAllNews)
  .post(postNews)

router
  .route("/:id")
  .put(updateNews)
  .delete(deleteNews);

module.exports = router;
