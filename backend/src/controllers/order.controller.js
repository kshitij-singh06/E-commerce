const prisma = require('../utils/prisma');

// POST /api/orders  → place order (checkout)
exports.placeOrder = async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Get all cart items for this user, with product info
    const cartItems = await prisma.cart.findMany({
      where: { userId },
      include: {
        product: true,
      },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // 2. Check stock and calculate total
    let totalAmount = 0;

    for (const item of cartItems) {
      if (!item.product) {
        return res.status(400).json({ error: "Product not found for a cart item" });
      }

      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          error: `Not enough stock for product: ${item.product.name}`,
        });
      }

      totalAmount += item.product.price * item.quantity;
    }

    // 3. Use a transaction so all DB steps succeed or all fail
    const order = await prisma.$transaction(async (tx) => {
      // 3a. Create order
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalAmount,
          // status will default to PENDING from schema
        },
      });

      // 3b. Create order items
      const orderItemsData = cartItems.map((item) => ({
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price, // snapshot of price at order time
      }));

      await tx.orderItem.createMany({
        data: orderItemsData,
      });

      // 3c. Decrease stock for each product
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      // 3d. Clear the cart
      await tx.cart.deleteMany({
        where: { userId },
      });

      return newOrder;
    });

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong while placing order" });
  }
};

// GET /api/orders  → get all orders for logged-in user
exports.getMyOrders = async (req, res) => {
  const userId = req.user.id;

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: {
              select: { name: true, price: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not fetch orders" });
  }
};
