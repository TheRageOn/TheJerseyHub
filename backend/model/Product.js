const mongoose = require("mongoose");

// Stock available for each size
const sizeSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: true,
      trim: true,
      enum: ["S", "M", "L", "XL", "XXL"],
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

// Product model
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ["club", "nation", "special"],
      required: true,
    },

    teamName: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPrice: {
      type: Number,
      min: 0,
      default: 0,
    },

    images: [
      {
        type: String,
        required: true,
      },
    ],

    sizes: [sizeSchema],

    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Product", productSchema);
