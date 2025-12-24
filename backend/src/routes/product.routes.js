const express = require('express');
const protect = require('../middlewares/auth.middleware');
const adminOnly = require('../middlewares/role.middleware');
const upload = require("../middlewares/upload");

const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/product.controller');

const router = express.Router();

// Public (only logged-in users)
router.get('/', protect, getProducts);
router.get('/:id', protect, getProduct);

// Admin only
router.post('/', protect, adminOnly, upload.single("image"), createProduct);
router.put('/:id', protect, adminOnly, upload.single("image"), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
