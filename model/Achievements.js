const mongoose = require("mongoose");
const { Schema } = mongoose;

const achievementsSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  link: {
    type: String,
  },
  image: {
    url: String,
    key: String,
    originalName: String,
    size: Number,
    mimetype: String,
  },
}, { timestamps: true });

module.exports = mongoose.model("Achievements", achievementsSchema);