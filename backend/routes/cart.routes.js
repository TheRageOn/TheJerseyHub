const express = require("express");
const router = express.Router();

const cartController = require("../controllers/cart.controller");
const optionalAuth = require("../middlewares/optionalAuth");

// Customer cart routes
router.get("/", optionalAuth, cartController.getCart);
router.post("/", optionalAuth, cartController.addToCart);
router.patch("/:productId/:size", optionalAuth, cartController.updateCartItem);
router.delete("/:productId/:size", optionalAuth, cartController.removeCartItem);
router.delete("/", optionalAuth, cartController.clearCart);

module.exports = router;
