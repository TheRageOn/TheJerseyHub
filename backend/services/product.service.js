const Product = require("../model/Product");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Create a product from the validated admin request data
exports.createProduct = async (data) => {
  return Product.create(data);
};

// Get products with optional catalog filters
exports.getAllProducts = async (filters) => {
  const query = {};

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.teamName) {
    query.teamName = {
      $regex: escapeRegex(filters.teamName),
      $options: "i",
    };
  }

  if (filters.minPrice || filters.maxPrice) {
    query.price = {};

    if (filters.minPrice) {
      query.price.$gte = Number(filters.minPrice);
    }

    if (filters.maxPrice) {
      query.price.$lte = Number(filters.maxPrice);
    }
  }

  if (filters.search) {
    const searchRegex = {
      $regex: escapeRegex(filters.search),
      $options: "i",
    };

    query.$or = [
      { name: searchRegex },
      { teamName: searchRegex },
      { description: searchRegex },
    ];
  }

  return Product.find(query).sort({ createdAt: -1 });
};

// Get one product by its ID
exports.getProductById = async (productId) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};

// Update all editable product fields
exports.updateProduct = async (productId, data) => {
  const product = await Product.findByIdAndUpdate(
    productId,
    { $set: data },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};

// Delete a product from the catalog
exports.deleteProduct = async (productId) => {
  const product = await Product.findByIdAndDelete(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};
