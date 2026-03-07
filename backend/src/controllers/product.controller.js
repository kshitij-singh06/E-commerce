const prisma = require('../utils/prisma');
const { v2: cloudinary } = require('cloudinary');

// Helper: delete image from Cloudinary by URL
async function deleteCloudinaryImage(imageUrl) {
  if (!imageUrl || !imageUrl.includes('cloudinary')) return;
  try {
    // Extract public_id from URL: .../ecommerce-products/filename.ext
    const parts = imageUrl.split('/');
    const folder = parts[parts.length - 2];
    const fileWithExt = parts[parts.length - 1];
    const publicId = `${folder}/${fileWithExt.split('.')[0]}`;
    await cloudinary.uploader.destroy(publicId);
  } catch { /* silently ignore cleanup errors */ }
}

// CREATE product
exports.createProduct = async (req, res) => {
  try {
    const { name, price, stock, description } = req.body;

    const imageUrl = req.file ? req.file.path : null;

    const product = await prisma.product.create({
      data: {
        name,
        price: Number(price),
        stock: Number(stock),
        description,
        imageUrl
      }
    });

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to create product" });
  }
};

// GET all products with search and price filters
exports.getProducts = async (req, res) => {
  try {
    const { search, min, max } = req.query;
    const where = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (min || max) {
      where.price = {};
      if (min) where.price.gte = Number(min);
      if (max) where.price.lte = Number(max);
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch products" });
  }
};

// GET product by ID
exports.getProduct = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) }
    });

    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch product" });
  }
};

// UPDATE product
exports.updateProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const updateData = {};

    if (req.body.name) updateData.name = req.body.name;
    if (req.body.description !== undefined)
      updateData.description = req.body.description;

    if (req.body.price !== undefined && req.body.price !== "")
      updateData.price = Number(req.body.price);

    if (req.body.stock !== undefined && req.body.stock !== "")
      updateData.stock = Number(req.body.stock);

    if (req.file) {
      await deleteCloudinaryImage(product.imageUrl);
      updateData.imageUrl = req.file.path;
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
};

// DELETE product
exports.deleteProduct = async (req, res) => {
  const id = Number(req.params.id);

  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    await deleteCloudinaryImage(product.imageUrl);
    await prisma.product.delete({ where: { id } });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
};
