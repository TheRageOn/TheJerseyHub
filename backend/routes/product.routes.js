const express = require("express");
const router = express.Router();

const productController = require("../controllers/product.controller");
const { protect, isAdmin } = require("../middlewares/auth.middleware");

// Public product routes
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

// Admin product management routes
router.post("/", protect, isAdmin, productController.createProduct);
router.put("/:id", protect, isAdmin, productController.updateProduct);
router.delete("/:id", protect, isAdmin, productController.deleteProduct);

module.exports = router;
