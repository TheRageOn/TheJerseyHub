const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const { validateAuth } = require("../middlewares/validateAuth");

// Register user
router.post("/register", validateAuth("register"), authController.registerUser);

// Login user
router.post("/login", validateAuth("login"), authController.loginUser);

// Forget password
router.post("/forget-password", authController.forgetPassword);

module.exports = router;
