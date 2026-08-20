const productService = require("../services/product.service");

// Create a product for the catalog
exports.createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: {
        product,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all products for the public catalog
exports.getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts(req.query);

    res.status(200).json({
      success: true,
      data: {
        products,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get one product for the public catalog
exports.getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);

    res.status(200).json({
      success: true,
      data: {
        product,
      },
    });
  } catch (error) {
    const statusCode = error.message === "Product not found" ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// Update a product in the catalog
exports.updateProduct = async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: {
        product,
      },
    });
  } catch (error) {
    const statusCode = error.message === "Product not found" ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a product from the catalog
exports.deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    const statusCode = error.message === "Product not found" ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};
