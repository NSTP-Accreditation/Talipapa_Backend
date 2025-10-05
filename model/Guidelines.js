const mongoose = require("mongoose");
const { Schema } = mongoose;

const guidelineSchema = new Schema({
  category: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
  },
});

module.exports = mongoose.model("Guideline", guidelineSchema);
