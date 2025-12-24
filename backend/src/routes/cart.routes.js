const express = require('express');
const protect = require('../middlewares/auth.middleware');
const {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItem
} = require('../controllers/cart.controller');

const router = express.Router();

router.get('/', protect, getCart);
router.post('/:productId', protect, addToCart);
router.put('/:id', protect, updateCartItem);  // 👈 MUST exist
router.delete('/:id', protect, removeFromCart);

module.exports = router;
