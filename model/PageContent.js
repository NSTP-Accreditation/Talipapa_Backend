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
  baranggay_name: {
    type: String,
    required: true,
  },
  baranggay_description: {
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

module.exports = mongoose.model("PageContent", pageContentSchema);

// nag add ako ng baranggay_name at baranggay_description
