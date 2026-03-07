const express = require('express');
const dotenv = require('dotenv');
const cors = require("cors");

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: "API is running" });
});

// Auth routes
const authRoutes = require('./routes/auth.routes');
const protect = require('./middlewares/auth.middleware');

app.use('/api/auth', authRoutes);
app.get('/api/auth/me', protect, (req, res) => {
  res.json({ message: "User authenticated", user: req.user });
});

// Product routes
const productRoutes = require('./routes/product.routes');
app.use('/api/products', productRoutes);

// Cart routes
const cartRoutes = require('./routes/cart.routes');
app.use('/api/cart', cartRoutes);

// Order routes
const orderRoutes = require('./routes/order.routes');
app.use('/api/orders', orderRoutes);

// Static uploads
app.use('/uploads', express.static('uploads'));

module.exports = app;