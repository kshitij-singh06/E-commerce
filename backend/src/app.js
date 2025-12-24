const express = require('express');
const dotenv = require('dotenv');



dotenv.config();

const authRoutes = require('./routes/auth.routes');

const app =express();

const cors = require("cors");
app.use(cors());

app.use(express.json());

app.get('/api/health',(req,res)=>{
    res.json({status:'ok',message:"API is working ra"});   
});

app.use('/api/auth', authRoutes);

const protect = require('./middlewares/auth.middleware');

// Protected test route
app.get('/api/auth/me', protect, (req, res) => {
  res.json({ message: "User authenticated", user: req.user });
});

const productRoutes = require('./routes/product.routes');
app.use('/api/products', productRoutes);

const cartRoutes = require('./routes/cart.routes');
app.use('/api/cart', cartRoutes);

const orderRoutes = require('./routes/order.routes');
app.use('/api/orders', orderRoutes);

app.use('/uploads', express.static('uploads'));

module.exports=app;