const express = require('express');
const router = express.Router();
const { getProducts, createProduct, updateProduct, deleteProduct } = require('../../controller/productController');
const verifyJWT = require('../../middlewares/verifyJWT')
const roles = require('../../config/roles');
const verifyRoles = require('../../middlewares/verifyRoles');


router.route('/')
  .get(getProducts)
  .post(verifyJWT, verifyRoles(roles.Admin, roles.SuperAdmin), createProduct)

router.route("/:id")
  .all(verifyJWT, verifyRoles(roles.Admin, roles.SuperAdmin))
  .put(updateProduct)
  .delete(deleteProduct)
module.exports = router;