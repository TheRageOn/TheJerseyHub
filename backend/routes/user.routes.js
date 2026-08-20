const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const { protect } = require("../middlewares/auth.middleware");

// Customer profile routes
router.get("/profile", protect, userController.getProfile);
router.put("/profile", protect, userController.updateProfile);
router.put("/change-password", protect, userController.changePassword);

// Admin user management routes
router.get("/", protect, userController.getAllUsers);
router.patch("/:id/block", protect, userController.toggleUserBlock);
router.delete("/:id", protect, userController.deleteUser);

module.exports = router;
