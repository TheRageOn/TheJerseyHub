const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const { validateAuth } = require("../middlewares/validateAuth");
const { protect } = require("../middlewares/auth.middleware");

// Register user
router.post("/register", validateAuth("register"), authController.registerUser);

// Login user
router.post("/login", validateAuth("login"), authController.loginUser);

// Get current user session (Protected via httpOnly cookie)
router.get("/me", protect, authController.getMe);

// Logout user (Clears httpOnly cookie)
router.post("/logout", authController.logoutUser);

// Forget password
router.post("/forget-password", authController.forgetPassword);

module.exports = router;
