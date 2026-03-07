const prisma = require('../utils/prisma');

exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cartItems = await prisma.cart.findMany({
      where: { userId },
      include: {
        product: {
          select: { name: true, price: true, stock: true, imageUrl: true }
        }
      }
    });

    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch cart" });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = Number(req.params.productId);
    const quantity = Number(req.body?.quantity) || 1;

    if (quantity < 1) {
      return res.status(400).json({ error: "Quantity must be at least 1" });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: "Product not found" });

    if (product.stock < quantity) {
      return res.status(400).json({ error: "Not enough stock" });
    }

    const existing = await prisma.cart.findFirst({
      where: { userId, productId }
    });

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (product.stock < newQty) {
        return res.status(400).json({ error: "Not enough stock" });
      }
      const updated = await prisma.cart.update({
        where: { id: existing.id },
        data: { quantity: newQty }
      });
      return res.json({ message: "Quantity updated", cart: updated });
    }

    const cart = await prisma.cart.create({
      data: { userId, productId, quantity }
    });

    res.status(201).json({ message: "Added to cart", cart });
  } catch (error) {
    res.status(500).json({ error: "Could not add to cart" });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;

    const item = await prisma.cart.findUnique({ where: { id } });

    if (!item || item.userId !== userId) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    await prisma.cart.delete({ where: { id } });

    res.json({ message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove item" });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { quantity } = req.body;
    const userId = req.user.id;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: "Quantity must be at least 1" });
    }

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
    res.status(500).json({ error: "Could not update cart item" });
  }
};
