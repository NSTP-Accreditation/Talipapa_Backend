const mongoose = require("mongoose");
const { Schema } = mongoose;

const materialSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  pointsPerKg: {
    type: Number,
    default: 1,
  },
  image: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date
});

module.exports = mongoose.model("Material", materialSchema);
