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
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
  },
});

const PageContent = mongoose.model("PageContent", pageContentSchema);

module.exports = PageContent;
