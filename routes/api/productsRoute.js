const express = require('express');
const router = express.Router();
const { getProducts, createProduct } = require('../../controller/productController');
const verifyJWT = require('../../middlewares/verifyJWT')
const roles = require('../../config/roles');
const verifyRoles = require('../../middlewares/verifyRoles');


router.route('/')
  .get(getProducts)
  .post(verifyJWT, verifyRoles(roles.Admin, roles.SuperAdmin), createProduct)
// TODO: MAKE UPDATE and DELELTE PRODUCT

module.exports = router;