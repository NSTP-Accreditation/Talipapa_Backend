const mongoose = require("mongoose");
const { Schema } = mongoose;

const pageContentSchema = new Schema({
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

module.exports = mongoose.model("PageContent", pageContentSchema);

// nag add ako ng baranggay_name at baranggay_description
