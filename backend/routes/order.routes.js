const express = require("express");
const router = express.Router();

const orderController = require("../controllers/order.controller");
const { protect, isAdmin } = require("../middlewares/auth.middleware");

// Customer order routes
router.post("/", protect, orderController.createOrder);
router.get("/my-orders", protect, orderController.getMyOrders);

// Admin order management routes
router.get("/", protect, isAdmin, orderController.getAllOrders);
router.put("/:id/status", protect, isAdmin, orderController.updateOrderStatus);
router.delete("/:id", protect, isAdmin, orderController.deleteOrder);

module.exports = router;
