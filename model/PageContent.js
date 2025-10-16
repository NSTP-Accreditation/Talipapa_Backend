const mongoose = require("mongoose");
const { Schema } = mongoose;

const pageContentSchema = new Schema(
  {
    mission: {
      type: String,
      required: true,
    },
    vision: {
      type: String,
      required: true,
    },
    barangayName: {
      type: String,
      required: true,
    },
    barangayHistory: {
      type: String,
      required: true,
    },
    barangayDescription: {
      type: String,
      required: true,
    },
    image: {
      url: String,
      key: String,
      originalName: String,
      size: Number,
      mimetype: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PageContent", pageContentSchema);
