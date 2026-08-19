const express = require("express");

const authRoutes = require("./routes/auth.routes");
const morgan = require("morgan");
const app = express();

// Parse incoming JSON requests
app.use(express.json());
app.use(morgan("dev"));

// Authentication routes
app.use("/api/auth", authRoutes);

module.exports = app;
