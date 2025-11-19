const mongoose = require("mongoose");
const { Schema } = mongoose;

const carouselSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  subTitle: String,
  link: String,
  order: {
    type: Number,
    required: true,
  },
  image: {
    url: String,
    key: String,
    originalName: String,
    size: Number,
    mimetype: String,
  },
});

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
    youtubeUrl: {
      type: String,
      default: null,
    },
    image: {
      url: String,
      key: String,
      originalName: String,
      size: Number,
      mimetype: String,
    },
    carousel: {
      type: [carouselSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PageContent", pageContentSchema);
