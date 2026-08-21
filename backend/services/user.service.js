const bcrypt = require("bcryptjs");

const User = require("../model/User");
const Cart = require("../model/Cart");
const Order = require("../model/Order");

// Check whether a user's block is still active
const getActiveBlock = (user) => {
  if (!user.isBlocked) {
    return false;
  }

  if (user.blockedUntil && user.blockedUntil <= new Date()) {
    return false;
  }

  return true;
};

// Create a customer with a securely hashed password
exports.createUser = async ({ name, email, password, phone }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  return User.create({ name, email, password: hashedPassword, phone });
};

// Get paginated customer accounts with optional filters
exports.getAllUsers = async ({ page = 1, limit = 20, search, status }) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const query = { role: "customer" };
  const filters = [];

  if (search) {
    filters.push({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ],
    });
  }

  if (status === "blocked") {
    filters.push({
      isBlocked: true,
      $or: [{ blockedUntil: null }, { blockedUntil: { $gt: new Date() } }],
    });
  } else if (status === "active") {
    filters.push({
      $or: [
        { isBlocked: false },
        { isBlocked: true, blockedUntil: { $lte: new Date() } },
      ],
    });
  }

  if (filters.length) {
    query.$and = filters;
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize),
    User.countDocuments(query),
  ]);

  return {
    users: users.map((user) => ({
      ...user.toObject(),
      isBlocked: getActiveBlock(user),
    })),
    pagination: {
      page: currentPage,
      limit: pageSize,
      total,
      pages: Math.ceil(total / pageSize),
    },
  };
};

// Update only the current user's name
exports.updateProfile = async (userId, data) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { name: data.name } },
    { new: true, runValidators: true },
  ).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// Update customer details from the admin panel
exports.updateUserByAdmin = async (userId, data) => {
  const user = await User.findOneAndUpdate(
    { _id: userId, role: "customer" },
    { $set: { name: data.name, phone: data.phone } },
    { new: true, runValidators: true, projection: "-password" },
  );

  if (!user) {
    throw new Error("Customer not found");
  }

  return user;
};

// Verify and replace the current user's password
exports.changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);

  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    throw new Error("Current password is incorrect");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
};

// Block a customer for a selected number of days or unblock them
exports.toggleUserBlock = async (userId, durationDays) => {
  const user = await User.findById(userId);

  if (!user || user.role === "admin") {
    throw new Error("Customer not found");
  }

  if (!Number.isInteger(durationDays) || durationDays < 0) {
    throw new Error("durationDays must be a non-negative integer");
  }

  if (durationDays === 0) {
    user.isBlocked = false;
    user.blockedUntil = null;
  } else {
    user.isBlocked = true;
    user.blockedUntil = new Date(
      Date.now() + durationDays * 24 * 60 * 60 * 1000,
    );
  }

  await user.save();
  return user.toObject({
    transform: (_, result) => {
      delete result.password;
      return result;
    },
  });
};

// Delete a customer and remove their cart and order records
exports.deleteUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user || user.role === "admin") {
    throw new Error("Customer not found");
  }

  await Promise.all([
    Cart.deleteMany({ user: user._id }),
    Order.deleteMany({ user: user._id }),
  ]);
  await User.deleteOne({ _id: user._id });
};
