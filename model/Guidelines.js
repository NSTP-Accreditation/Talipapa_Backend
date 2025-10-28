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
  difficultyLevel: {
    type: String,
    required: false,
  },
  totalEstimatedTime: {
    type: String,
    required: false,
  },
  difficulty: {
    type: String,
    required: false,
  },
  lastUpdated: {
    type: Date,
    required: false,
  },
  steps: {
    type: [stepSchema],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

module.exports = mongoose.model("Guideline", guidelineSchema);
