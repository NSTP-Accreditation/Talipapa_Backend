const mongoose = require("mongoose");
const { Schema } = mongoose;

const skillSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  short: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

module.exports = mongoose.model("Skill", skillSchema);
