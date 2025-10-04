// Mission, Vision, Achievements = [{ title, description, link }];

const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * Achievement Schema
 * Separate model for achievements
 */
const achievementSchema = new Schema({
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
    required: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
  },
});

const Achievement = mongoose.model("Achievement", achievementSchema);

/**
 * Page Content Schema
 * Holds Mission, Vision, and references Achievements
 */
const pageContentSchema = new Schema({
  mission: {
    type: String,
    required: true,
  },
  vision: {
    type: String,
    required: true,
  },
  achievements: [
    {
      type: Schema.Types.ObjectId,
      ref: "Achievement",
      required: false, // ✅ optional
    },
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
  },
});

const PageContent = mongoose.model("PageContent", pageContentSchema);

module.exports = { PageContent, Achievement };
