const express = require("express");
const router = express.Router();

const productController = require("../controllers/product.controller");
const { protect } = require("../middlewares/auth.middleware");

// Public product routes
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

// Admin product management routes
router.post("/", protect, productController.createProduct);
router.put("/:id", protect, productController.updateProduct);
router.delete("/:id", protect, productController.deleteProduct);

module.exports = router;
