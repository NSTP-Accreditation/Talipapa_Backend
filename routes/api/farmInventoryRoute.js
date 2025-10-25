const express = require("express");
const router = express.Router();
const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("../../config/awsConfig");
const verifyJWT = require("../../middlewares/verifyJWT");
const verifyRoles = require("../../middlewares/verifyRoles");
const roles = require("../../config/roles");

const {
  getAllFarmInventory,
  getFarmInventoryById,
  createFarmInventory,
  updateFarmInventory,
  updateFarmInventoryStocks,
  deleteFarmInventory,
  searchFarmInventory,
  getFarmInventoryBySubCategory,
  getLowStockFarmInventory,
} = require("../../controller/farmInventoryController");

// Configure multer for S3 upload
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: "public-read",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `farm-inventory/${uniqueSuffix}-${file.originalname}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Public routes (no authentication required for viewing)
router.get("/", getAllFarmInventory);
router.get("/low-stock", getLowStockFarmInventory);
router.get("/search/:query", searchFarmInventory);
router.get("/subcategory/:subCategory", getFarmInventoryBySubCategory);
router.get("/:id", getFarmInventoryById);

// Protected routes (require authentication and admin role)
router.post(
  "/",
  verifyJWT,
  verifyRoles(roles.Admin, roles.SuperAdmin),
  upload.single("image"),
  createFarmInventory
);

router.put(
  "/:id",
  verifyJWT,
  verifyRoles(roles.Admin, roles.SuperAdmin),
  upload.single("image"),
  updateFarmInventory
);

router.patch(
  "/:id/stocks",
  verifyJWT,
  verifyRoles(roles.Admin, roles.SuperAdmin),
  updateFarmInventoryStocks
);

router.delete(
  "/:id",
  verifyJWT,
  verifyRoles(roles.Admin, roles.SuperAdmin),
  deleteFarmInventory
);

module.exports = router;
