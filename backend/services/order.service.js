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

// Update order and payment status from the admin order panel.
exports.updateOrderStatus = async (orderId, statuses = {}) => {
  const orderStatuses = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];
  const paymentStatuses = ["pending", "paid", "failed"];
  const orderStatus = statuses.orderStatus || statuses.status;
  const paymentStatus = statuses.paymentStatus;
  const updates = {};

  if (orderStatus !== undefined) {
    if (
      typeof orderStatus !== "string" ||
      !orderStatuses.includes(orderStatus.toLowerCase())
    ) {
      throw new Error("Invalid order status");
    }
    updates.orderStatus = orderStatus.toLowerCase();
  }

  if (paymentStatus !== undefined) {
    if (
      typeof paymentStatus !== "string" ||
      !paymentStatuses.includes(paymentStatus.toLowerCase())
    ) {
      throw new Error("Invalid payment status");
    }
    updates.paymentStatus = paymentStatus.toLowerCase();
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("Order status or payment status is required");
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    { $set: updates },
    { returnDocument: "after" },
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
