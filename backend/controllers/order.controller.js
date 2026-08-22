const orderService = require("../services/order.service");

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const order = await orderService.createOrder(req.body, userId);
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: { order },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const orders = await orderService.getMyOrders(userId);
    res.status(200).json({
      success: true,
      data: { orders },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders(req.query);
    res.status(200).json({
      success: true,
      data: { orders },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, orderStatus, paymentStatus } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, {
      status,
      orderStatus,
      paymentStatus,
    });
    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: { order },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await orderService.deleteOrder(req.params.id);
    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
      data: { order },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
