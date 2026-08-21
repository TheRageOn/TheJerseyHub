const mongoose = require("mongoose");
const Order = require("../model/Order");

// Create new customer order
exports.createOrder = async (orderData, userId) => {
  const order = await Order.create({
    ...orderData,
    user: userId || orderData.userId || new mongoose.Types.ObjectId(),
  });
  return order;
};

// Get personal orders for a specific user
exports.getMyOrders = async (userId) => {
  if (!userId) return [];
  return Order.find({ user: userId }).sort({ createdAt: -1 });
};

// Get all orders across the platform (Admin Dispatch)
exports.getAllOrders = async (filters = {}) => {
  const query = {};
  if (filters.status && filters.status !== "ALL") {
    query.orderStatus = filters.status.toLowerCase();
  }
  return Order.find(query)
    .populate("user", "name email phone")
    .sort({ createdAt: -1 });
};

// Update order status (pending, processing, shipped, delivered, cancelled)
exports.updateOrderStatus = async (orderId, status) => {
  const order = await Order.findByIdAndUpdate(
    orderId,
    { $set: { orderStatus: status.toLowerCase() } },
    { returnDocument: "after" }
  ).populate("user", "name email phone");

  if (!order) {
    throw new Error("Order not found");
  }
  return order;
};

// Delete order
exports.deleteOrder = async (orderId) => {
  const order = await Order.findByIdAndDelete(orderId);
  if (!order) {
    throw new Error("Order not found");
  }
  return order;
};
