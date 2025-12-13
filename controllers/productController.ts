import asyncHandler from 'express-async-handler';
import Product from '../models/productModel';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, price, images, category, rating, badge, shortDescription, longDescription, specifications, features } = req.body;

  const product = new Product({
    name,
    price,
    images: images || [],
    category,
    rating: rating || 0,
    badge: badge || null,
    shortDescription,
    longDescription,
    specifications: specifications || {},
    features: features || [],
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, images, category, rating, badge, shortDescription, longDescription, specifications, features } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name;
    product.price = price;
    product.images = images;
    product.category = category;
    product.rating = rating;
    product.badge = badge;
    product.shortDescription = shortDescription;
    product.longDescription = longDescription;
    product.specifications = specifications;
    product.features = features;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});


export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
