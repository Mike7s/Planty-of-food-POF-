const express = require("express");
const router =  express.Router();

const {
  createProduct,
  deleteProduct,
  updateProduct
} = require ('../controller/products.controller')

router.post('/', createProduct);
router.delete('/:id',deleteProduct);
router.put('/:id',updateProduct);

module.export = router;