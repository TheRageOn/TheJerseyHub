const mongoose = require("mongoose");
const Cart = require("../model/Cart");
const Product = require("../model/Product");

const getUserId = (req) => req.user?._id || req.user?.id;

const requireCustomer = (req, res) => {
  const userId = getUserId(req);
  if (!userId || !mongoose.isValidObjectId(userId)) {
    res.status(401).json({
      success: false,
      message: "Log in to save your cart to your account",
    });
    return null;
  }
  return userId;
};

exports.getCart = async (req, res) => {
  const userId = getUserId(req);
  if (!userId || !mongoose.isValidObjectId(userId)) {
    return res
      .status(200)
      .json({ success: true, data: { cart: null, items: [] } });
  }

  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  return res
    .status(200)
    .json({ success: true, data: { cart, items: cart?.items || [] } });
};

exports.addToCart = async (req, res) => {
  const userId = requireCustomer(req, res);
  if (!userId) return;

  const { productId, size, quantity = 1 } = req.body;
  const amount = Number(quantity);
  if (!productId || !size || !Number.isInteger(amount) || amount < 1) {
    return res.status(400).json({
      success: false,
      message: "Product, size, and a valid quantity are required",
    });
  }

  const product = mongoose.isValidObjectId(productId)
    ? await Product.findById(productId)
    : await Product.findOne({ $or: [{ id: productId }, { code: productId }] });
  if (!product)
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  if (!product.sizesAvailable.includes(size)) {
    return res.status(400).json({
      success: false,
      message: `${product.name} is not available in size ${size}`,
    });
  }
  if (product.stock < amount) {
    return res
      .status(400)
      .json({ success: false, message: "Not enough stock available" });
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = new Cart({ user: userId, items: [] });
  const item = cart.items.find(
    (entry) =>
      String(entry.product) === String(product._id) && entry.size === size,
  );
  if (item) item.quantity += amount;
  else cart.items.push({ product: product._id, size, quantity: amount });
  await cart.save();
  await cart.populate("items.product");
  return res
    .status(200)
    .json({ success: true, data: { cart, items: cart.items } });
};

exports.removeCartItem = async (req, res) => {
  const userId = requireCustomer(req, res);
  if (!userId) return;
  const cart = await Cart.findOne({ user: userId });
  if (!cart)
    return res.status(404).json({ success: false, message: "Cart not found" });

  cart.items = cart.items.filter(
    (item) =>
      !(
        String(item.product) === req.params.productId &&
        item.size === req.params.size
      ),
  );
  await cart.save();
  await cart.populate("items.product");
  return res
    .status(200)
    .json({ success: true, data: { cart, items: cart.items } });
};

exports.updateCartItem = async (req, res) => {
  const userId = requireCustomer(req, res);
  if (!userId) return;
  const quantity = Number(req.body.quantity);
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res
      .status(400)
      .json({ success: false, message: "A valid quantity is required" });
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart)
    return res.status(404).json({ success: false, message: "Cart not found" });
  const item = cart.items.find(
    (entry) =>
      String(entry.product) === req.params.productId &&
      entry.size === req.params.size,
  );
  if (!item)
    return res
      .status(404)
      .json({ success: false, message: "Cart item not found" });
  item.quantity = quantity;
  await cart.save();
  await cart.populate("items.product");
  return res
    .status(200)
    .json({ success: true, data: { cart, items: cart.items } });
};

exports.clearCart = async (req, res) => {
  const userId = requireCustomer(req, res);
  if (!userId) return;
  const cart = await Cart.findOneAndUpdate(
    { user: userId },
    { $set: { items: [] } },
    { new: true, upsert: true },
  ).populate("items.product");
  return res.status(200).json({ success: true, data: { cart, items: [] } });
};
