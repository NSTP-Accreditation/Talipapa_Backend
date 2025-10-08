const mongoose = require("mongoose");
const { Schema } = mongoose;

const newsSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  }, // PUBLISHED OR DRAFT
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

module.exports = mongoose.model("News", newsSchema);
