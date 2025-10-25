const express = require('express');
const router = express.Router();
const { getProducts, createProduct, updateProduct, deleteProduct } = require('../../controller/productController');
const verifyJWT = require('../../middlewares/verifyJWT')
const roles = require('../../config/roles');
const verifyRoles = require('../../middlewares/verifyRoles');
const upload = require('../../middlewares/fileUpload');


router.route('/')
  .get(getProducts)
  .post(verifyJWT, verifyRoles(roles.Admin), upload.single('image'), createProduct)

router.route("/:id")
  .all(verifyJWT, verifyRoles(roles.Admin))
  .put(upload.single('image'), updateProduct)
  .delete(deleteProduct)
module.exports = router;