const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  subCategory: {
    type: String,
    required: true,
  },
  stocks: {
    type: Number,
    default: 0,
  },
  requiredPoints: {
    type: Number,
    required: true,
  },
  image:  {
    url: String,
    key: String,
    originalName: String,
    size: Number,
    mimetype: String
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: Date,
});

module.exports = mongoose.model("Product", productSchema);
