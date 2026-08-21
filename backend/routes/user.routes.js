const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const { protect, isAdmin } = require("../middlewares/auth.middleware");
const { validateAuth } = require("../middlewares/validateAuth");

// Customer profile routes
router.get("/profile", protect, userController.getProfile);
router.put("/profile", protect, userController.updateProfile);
router.put("/change-password", protect, userController.changePassword);

// Admin user management routes
router.post(
  "/",
  protect,
  isAdmin,
  validateAuth("register"),
  userController.createUser,
);
router.get("/", protect, isAdmin, userController.getAllUsers);
router.put("/:id", protect, isAdmin, userController.updateUserByAdmin);
router.patch("/:id/block", protect, isAdmin, userController.toggleUserBlock);
router.delete("/:id", protect, isAdmin, userController.deleteUser);

module.exports = router;
