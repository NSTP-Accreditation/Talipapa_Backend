const express = require("express");
const {
  getAllNews,
  postNews,
  updateNews,
  deleteNews,
} = require("../../controller/newsController");
const router = express.Router();
const verifyJWT = require("../../middlewares/verifyJWT");
const { checkPermission } = require("../../middlewares/checkPermission");
const { Permission } = require("../../middlewares/rbac.utils");

// Get all news - PUBLIC (no auth required)
router.get("/", getAllNews);

// Create news - MANAGE_NEWS permission required
router.post("/", verifyJWT, checkPermission(Permission.MANAGE_NEWS), postNews);

// Update news - MANAGE_NEWS permission required
router.put(
  "/:id",
  verifyJWT,
  checkPermission(Permission.MANAGE_NEWS),
  updateNews
);

// Delete news - MANAGE_NEWS permission required
router.delete(
  "/:id",
  verifyJWT,
  checkPermission(Permission.MANAGE_NEWS),
  deleteNews
);

module.exports = router;
