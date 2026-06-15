const express = require("express");

const authRoutes = require("./routes/auth.routes");

const app = express();

// Parse incoming JSON requests
app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);

module.exports = app;
