const mongoose = require("mongoose");
const { Schema } = mongoose;

const farmInventorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  mainCategory: {
    type: String,
    required: true,
    enum: ["Agricultural"],
    default: "Agricultural",
  },
  subCategory: {
    type: String,
    required: true,
    enum: ["Vegetables", "Herbal Plants", "Fruits", "Seedlings", "Trees"],
  },
  stocks: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  unit: {
    type: String,
    required: true,
    enum: ["kg", "pieces", "bundles", "sacks", "pots"],
    default: "pieces",
  },
  image: {
    url: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
    },
    size: {
      type: Number,
    },
    mimetype: {
      type: String,
    },
  },
  farmOrigin: {
    type: String,
  },
  lastRestocked: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model("FarmInventory", farmInventorySchema);
