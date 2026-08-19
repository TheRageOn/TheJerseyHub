const User = require("../model/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../Utils/generateToken");

// Register user
exports.registerUser = async (data) => {
  const { name, email, password, phone } = data;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
  };
};

// Login user (works for both admin and customer)
exports.loginUser = async (data) => {
  const { email, password } = data;

  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = generateToken("admin", "admin");

    return {
      token,
      user: {
        id: "admin",
        name: "Admin",
        email: process.env.ADMIN_EMAIL,
        role: "admin",
      },
    };
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user._id, user.role);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};
