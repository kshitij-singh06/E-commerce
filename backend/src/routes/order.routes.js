const express = require('express');
const protect = require('../middlewares/auth.middleware');
const adminOnly = require('../middlewares/role.middleware');
const { placeOrder, getMyOrders, getAllOrders } = require('../controllers/order.controller');

const router = express.Router();

router.post('/', protect, placeOrder);        // POST /api/orders
router.get('/', protect, getMyOrders);        // GET  /api/orders
router.get('/all', protect, adminOnly, getAllOrders); // GET /api/orders/all (admin)

module.exports = router;
