const productService = require("../services/product.service");

// Create a product for the catalog
exports.createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);

    res.status(201).json({
      success: true,
      message: "Jersey published successfully to database",
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

// Get all products for the catalog
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

// Get products specifically configured for the 3D landing page
exports.getLandingProducts = async (req, res) => {
  try {
    const products = await productService.getLandingProducts();

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

// Get one product by ID
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

// Update an existing product
exports.updateProduct = async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Jersey details updated successfully",
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

// Quick toggle placement (showOnLanding, landingOrder, showInShop, featured)
exports.updatePlacement = async (req, res) => {
  try {
    const product = await productService.updatePlacement(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Placement updated successfully",
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

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await productService.deleteProduct(req.params.id);

    res.status(200).json({
      success: true,
      message: "Jersey removed from archive",
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
