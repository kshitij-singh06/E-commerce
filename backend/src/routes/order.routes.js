const express = require('express');
const protect = require('../middlewares/auth.middleware');
const { placeOrder, getMyOrders } = require('../controllers/order.controller');

const router = express.Router();

router.post('/', protect, placeOrder);   // POST /api/orders
router.get('/', protect, getMyOrders);   // GET  /api/orders

module.exports = router;
