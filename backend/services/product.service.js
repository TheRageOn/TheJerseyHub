const mongoose = require("mongoose");
const Product = require("../model/Product");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Helper to construct query for ID or custom code
const buildIdQuery = (productId) => {
  if (mongoose.Types.ObjectId.isValid(productId) && String(new mongoose.Types.ObjectId(productId)) === String(productId)) {
    return { _id: productId };
  }
  return {
    $or: [
      { code: productId },
      { code: new RegExp(`^${escapeRegex(productId)}$`, "i") },
      { id: productId },
    ],
  };
};

// Get all products with optional filters
exports.getAllProducts = async (filters = {}) => {
  const query = {};

  if (filters.category && filters.category !== "ALL") {
    query.category = filters.category.toLowerCase();
  }

  if (filters.league && filters.league !== "ALL") {
    query.league = filters.league;
  }

  if (filters.showOnLanding !== undefined) {
    query.showOnLanding = filters.showOnLanding === "true" || filters.showOnLanding === true;
  }

  if (filters.showInShop !== undefined) {
    query.showInShop = filters.showInShop === "true" || filters.showInShop === true;
  }

  if (filters.featured !== undefined) {
    query.featured = filters.featured === "true" || filters.featured === true;
  }

  if (filters.search) {
    const searchRegex = {
      $regex: escapeRegex(filters.search),
      $options: "i",
    };

    query.$or = [
      { name: searchRegex },
      { club: searchRegex },
      { code: searchRegex },
      { season: searchRegex },
      { edition: searchRegex },
    ];
  }

  return Product.find(query).sort({ landingOrder: 1, createdAt: -1 });
};

// Get landing page products ordered by landingOrder
exports.getLandingProducts = async () => {
  return Product.find({ showOnLanding: true }).sort({ landingOrder: 1, createdAt: 1 });
};

// Get one product by its ID or Code
exports.getProductById = async (productId) => {
  const query = buildIdQuery(productId);
  const product = await Product.findOne(query);
  if (!product) {
    throw new Error("Product not found");
  }
  return product;
};

// Create a product
exports.createProduct = async (data) => {
  if (data.price && typeof data.price === "string") {
    const num = parseFloat(data.price.replace(/[^0-9.]/g, ""));
    data.priceNumeric = isNaN(num) ? 0 : num;
  }
  return Product.create(data);
};

// Update a product
exports.updateProduct = async (productId, data) => {
  if (data.price && typeof data.price === "string") {
    const num = parseFloat(data.price.replace(/[^0-9.]/g, ""));
    data.priceNumeric = isNaN(num) ? 0 : num;
  }

  const query = buildIdQuery(productId);
  const updatedProduct = await Product.findOneAndUpdate(query, data, {
    returnDocument: "after",
    runValidators: true,
  });

  if (!updatedProduct) {
    throw new Error("Product not found");
  }

  return updatedProduct;
};

// Quick toggle placement (showOnLanding, landingOrder, showInShop, featured)
exports.updatePlacement = async (productId, placementData) => {
  const query = buildIdQuery(productId);
  const updated = await Product.findOneAndUpdate(
    query,
    { $set: placementData },
    { returnDocument: "after" }
  );

  if (!updated) {
    throw new Error("Product not found");
  }

  return updated;
};

// Delete a product
exports.deleteProduct = async (productId) => {
  const query = buildIdQuery(productId);
  const deletedProduct = await Product.findOneAndDelete(query);
  if (!deletedProduct) {
    throw new Error("Product not found");
  }
  return deletedProduct;
};
