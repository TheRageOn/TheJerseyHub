const jwt = require("jsonwebtoken");

// Generate JWT token for authenticated user
const generateToken = (userId, role) => {
  return jwt.sign(
    {
      id: userId,
      role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  );
};

module.exports = generateToken;
