const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    season: {
      type: String,
      required: true,
      trim: true,
    },
    club: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: String,
      required: true,
      trim: true,
    },
    priceNumeric: {
      type: Number,
      default: 0,
    },
    imageSrc: {
      type: String,
      required: true,
      trim: true,
    },
    edition: {
      type: String,
      default: "HERITAGE VAULT EDITION",
      trim: true,
    },
    category: {
      type: String,
      enum: ["club", "retro", "special", "vintage", "nation"],
      default: "club",
      lowercase: true,
    },
    league: {
      type: String,
      default: "La Liga",
      trim: true,
    },
    sizesAvailable: {
      type: [String],
      enum: ["S", "M", "L", "XL", "XXL"],
      default: ["S", "M", "L", "XL"],
    },
    stock: {
      type: Number,
      default: 25,
      min: 0,
    },
    rating: {
      type: Number,
      default: 4.9,
      min: 1,
      max: 5,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    showOnLanding: {
      type: Boolean,
      default: false,
    },
    landingOrder: {
      type: Number,
      default: 0,
    },
    showInShop: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Helper to auto-calculate priceNumeric before save
productSchema.pre("save", function () {
  if (this.price && typeof this.price === "string") {
    const num = parseFloat(this.price.replace(/[^0-9.]/g, ""));
    if (!isNaN(num)) {
      this.priceNumeric = num;
    }
  }
});

module.exports = mongoose.model("Product", productSchema);
