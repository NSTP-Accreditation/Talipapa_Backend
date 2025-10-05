const express = require("express");
const {
  getAllPageContents,
  postPageContents,
  updatePageContents,
} = require("../../controller/pageContentController");

const router = express.Router();

router.route("")
      .get(getAllPageContents)
      .post(postPageContents);

router
.route("/:id").put(updatePageContents);

module.exports = router;
