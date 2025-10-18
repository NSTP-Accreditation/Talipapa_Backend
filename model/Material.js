const mongoose = require("mongoose");
const { Schema } = mongoose;

const materialSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  pointsPerKg: {
    type: Number,
    default: 1,
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
    default: Date.now,
  },
  updatedAt: Date
});

module.exports = mongoose.model("Material", materialSchema);
