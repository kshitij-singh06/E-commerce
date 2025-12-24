const prisma = require('../utils/prisma');

exports.getCart = async (req, res) => {
  const userId = req.user.id;

  const cartItems = await prisma.cart.findMany({
    where: { userId },
    include: {
      product: {
        select: { name: true, price: true, stock: true }
      }
    }
  });

  res.json(cartItems);
};

exports.addToCart = async (req, res) => {
  const userId = req.user.id;
  const productId = Number(req.params.productId);

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return res.status(404).json({ error: "Product not found" });

  if (product.stock <= 0) {
    return res.status(400).json({ error: "Product out of stock" });
  }

  const existing = await prisma.cart.findFirst({
    where: { userId, productId }
  });

  if (existing) {
    const updated = await prisma.cart.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + 1 }
    });
    return res.json({ message: "Quantity updated", cart: updated });
  }

  const cart = await prisma.cart.create({
    data: { userId, productId, quantity: 1 }
  });

  res.status(201).json({ message: "Added to cart", cart });
};

exports.updateCart = async (req, res) => {
  const userId = req.user.id;
  const productId = Number(req.params.productId);
  const { quantity } = req.body;

  if (quantity < 1) {
    return res.status(400).json({ error: "Quantity must be at least 1" });
  }

  const cartItem = await prisma.cart.findFirst({
    where: { userId, productId },
  });

  if (!cartItem) return res.status(404).json({ error: "Item not in cart" });

  const updated = await prisma.cart.update({
    where: { id: cartItem.id },
    data: { quantity }
  });

  res.json({ message: "Cart updated", cart: updated });
};

exports.removeFromCart = async (req, res) => {
  const id = Number(req.params.id);
  const userId = req.user.id;

  try {
    const item = await prisma.cart.findUnique({ where: { id } });

    if (!item || item.userId !== userId) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    await prisma.cart.delete({ where: { id } });

    res.json({ message: "Item removed from cart" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove item" });
  }
};


exports.updateCartItem = async (req, res) => {
  const id = Number(req.params.id);
  const { quantity } = req.body;
  const userId = req.user.id;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: "Quantity must be at least 1" });
  }

  try {
    const item = await prisma.cart.findUnique({
      where: { id },
      include: { product: true }
    });

    if (!item || item.userId !== userId) {
      return res.status(404).json({ error: "Item not found" });
    }

    if (item.product.stock < quantity) {
      return res.status(400).json({
        error: `Not enough stock for product: ${item.product.name}`
      });
    }

    const updated = await prisma.cart.update({
      where: { id },
      data: { quantity }
    });

    res.json({ message: "Cart updated", updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not update cart item" });
  }
};
