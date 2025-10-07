const mongoose = require("mongoose");
const { Schema } = mongoose;

const OfficialsSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  position: {
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

module.exports = mongoose.model("Officials", OfficialsSchema);
