const userService = require("../services/user.service");

// Get the current user's profile
exports.getProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: req.user },
  });
};

// Update the current user's profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await userService.updateProfile(req.user._id, req.body);
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Change the current user's password
exports.changePassword = async (req, res) => {
  try {
    await userService.changePassword(
      req.user._id,
      req.body.currentPassword,
      req.body.newPassword,
    );
    res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Create a user from the admin panel
exports.createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    const userData = user.toObject();
    delete userData.password;

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { user: userData },
    });
  } catch (error) {
    res.status(error.message === "User already exists" ? 409 : 400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all customer accounts for the admin panel
exports.getAllUsers = async (req, res) => {
  try {
    const result = await userService.getAllUsers(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Block or unblock a customer account
exports.toggleUserBlock = async (req, res) => {
  try {
    const durationDays = Number(req.body.durationDays);
    const user = await userService.toggleUserBlock(req.params.id, durationDays);

    res.status(200).json({
      success: true,
      message: user.isBlocked
        ? "User blocked successfully"
        : "User unblocked successfully",
      data: { user },
    });
  } catch (error) {
    const notFound = error.message === "Customer not found";
    res
      .status(notFound ? 404 : 400)
      .json({ success: false, message: error.message });
  }
};

// Delete a customer account and its related data
exports.deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(200).json({
      success: true,
      message: "User and related data deleted successfully",
    });
  } catch (error) {
    res.status(error.message === "Customer not found" ? 404 : 400).json({
      success: false,
      message: error.message,
    });
  }
};
