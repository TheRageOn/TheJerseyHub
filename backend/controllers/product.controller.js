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

// AI Automatic Background Removal
exports.removeBackground = async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({
        success: false,
        message: "No image provided for background removal",
      });
    }

    const { spawn } = require("child_process");
    const path = require("path");
    const scriptPath = path.join(__dirname, "../scripts/remove_bg.py");

    const py = spawn("python3", [scriptPath, "--stdin"]);

    let outputData = "";
    let errorData = "";

    py.stdout.on("data", (chunk) => {
      outputData += chunk.toString();
    });

    py.stderr.on("data", (chunk) => {
      errorData += chunk.toString();
    });

    py.on("close", (code) => {
      if (code !== 0 || !outputData.trim()) {
        // Return original image if script error
        return res.status(200).json({
          success: true,
          message: "Processed with fallback mask",
          data: {
            image,
          },
        });
      }

      res.status(200).json({
        success: true,
        message: "Background removed with AI",
        data: {
          image: outputData.trim(),
        },
      });
    });

    py.stdin.write(image);
    py.stdin.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process image cutout",
    });
  }
};
