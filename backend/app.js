const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const app = express();

// Global Middlewares
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

module.exports = app;
