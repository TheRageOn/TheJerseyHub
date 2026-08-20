const express = require("express");
const router = express.Router();

const orderController = require("../controllers/order.controller");
const { protect } = require("../middlewares/auth.middleware");

// Customer order routes
router.post("/", protect, orderController.createOrder);
router.get("/my-orders", protect, orderController.getMyOrders);

// Admin order management routes
router.get("/", protect, orderController.getAllOrders);
router.put("/:id/status", protect, orderController.updateOrderStatus);
router.delete("/:id", protect, orderController.deleteOrder);

module.exports = router;
