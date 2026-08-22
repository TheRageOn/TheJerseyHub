const mongoose = require("mongoose");
const Order = require("../model/Order");
const Product = require("../model/Product");

const orderStatuses = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
const paymentStatuses = ["pending", "paid", "failed"];

const findProduct = async (productId, session) => {
  if (!productId || typeof productId !== "string") {
    throw new Error("A valid product is required");
  }

  const query = mongoose.isValidObjectId(productId)
    ? { _id: productId }
    : { $or: [{ code: productId }, { id: productId }] };
  const product = await Product.findOne(query).session(session);
  if (!product) {
    throw new Error("Product not found");
  }
  return product;
};

// Create new customer order
exports.createOrder = async (orderData, userId) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("A valid customer account is required");
  }

  const { items, shippingAddress } = orderData || {};
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("At least one product is required");
  }
  if (
    !shippingAddress ||
    !shippingAddress.fullName ||
    !shippingAddress.phone ||
    !shippingAddress.street ||
    !shippingAddress.city
  ) {
    throw new Error("Complete shipping details are required");
  }

  const session = await mongoose.startSession();
  try {
    let createdOrder;
    await session.withTransaction(async () => {
      const trustedItems = [];
      let totalAmount = 0;

      for (const requestedItem of items) {
        const quantity = Number(requestedItem.quantity);
        const size = requestedItem.size;
        if (
          !Number.isInteger(quantity) ||
          quantity < 1 ||
          typeof size !== "string" ||
          !size
        ) {
          throw new Error("Each product requires a valid size and quantity");
        }

        const product = await findProduct(
          requestedItem.product || requestedItem.productId,
          session,
        );
        if (!product.sizesAvailable.includes(size)) {
          throw new Error(`${product.name} is not available in size ${size}`);
        }

        const updatedProduct = await Product.findOneAndUpdate(
          { _id: product._id, stock: { $gte: quantity } },
          { $inc: { stock: -quantity } },
          { new: true, session },
        );
        if (!updatedProduct) {
          throw new Error(`${product.name} does not have enough stock`);
        }

        const price = Number(product.priceNumeric);
        if (!Number.isFinite(price) || price < 0) {
          throw new Error(`${product.name} has an invalid price`);
        }

        trustedItems.push({
          product: product._id,
          name: product.name,
          image: product.imageSrc,
          size,
          quantity,
          price,
          customization: requestedItem.customization,
        });
        totalAmount += price * quantity;
      }

      const orders = await Order.create(
        [
          {
            user: userId,
            items: trustedItems,
            shippingAddress: {
              fullName: shippingAddress.fullName,
              phone: shippingAddress.phone,
              street: shippingAddress.street,
              city: shippingAddress.city,
              state: shippingAddress.state,
              country: shippingAddress.country || "Nepal",
            },
            paymentMethod: "Cash on Delivery",
            paymentStatus: "pending",
            orderStatus: "pending",
            totalAmount,
          },
        ],
        { session },
      );
      [createdOrder] = orders;
    });
    return createdOrder;
  } finally {
    await session.endSession();
  }
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
