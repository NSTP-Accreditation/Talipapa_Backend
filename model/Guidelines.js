const mongoose = require("mongoose");
const { Schema } = mongoose;

const stepSchema = new Schema({
  stepTitle: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: false,
  },
  estimatedTime: {
    type: String,
    required: false,
  },
  requiredDocuments: {
    type: String,
    required: false,
  },
  tips: {
    type: String,
    required: false,
  },
}, { _id: true });

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
