const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

// Register user
router.post("/register", authController.registerUser);

// Login user
router.post("/login", authController.loginUser);

module.exports = router;
