const express = require("express");
const router = express.Router();

const cartController = require("../controllers/cart.controller");
const { protect } = require("../middlewares/auth.middleware");

// Customer cart routes
router.get("/", protect, cartController.getCart);
router.post("/", protect, cartController.addToCart);
router.delete("/:productId/:size", protect, cartController.removeCartItem);
router.delete("/", protect, cartController.clearCart);

module.exports = router;
