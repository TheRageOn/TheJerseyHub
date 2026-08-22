const jwt = require("jsonwebtoken");
const User = require("../model/User");

// Attach a valid user when present, while allowing guest cart requests through.
const optionalAuth = async (req, res, next) => {
  try {
    const cookieToken = req.cookies && req.cookies.token;
    const headerToken =
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null;
    const token = cookieToken || headerToken;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.id === "admin" || decoded.role === "admin") {
        req.user = { id: "admin", role: "admin" };
      } else {
        req.user = await User.findById(decoded.id).select("-password");
      }
    }
  } catch {
    // Invalid or expired guest credentials are treated as unauthenticated.
  }

  next();
};

module.exports = optionalAuth;
