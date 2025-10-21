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
  biography: String,
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
  updatedAt: {
    type: Date,
  },
});

module.exports = mongoose.model("Officials", OfficialsSchema);
