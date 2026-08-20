const express = require("express");
const router = express.Router();

const analyticsController = require("../controllers/analytics.controller");
const { protect } = require("../middlewares/auth.middleware");

// Admin analytics routes
router.get("/sales", protect, analyticsController.getSalesAnalytics);

module.exports = router;
