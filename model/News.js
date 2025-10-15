const mongoose = require("mongoose");
const { Schema } = mongoose;

const newsSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  dateTime: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: false,
  },
  category: {
    type: String,
    required: false,
  },
  priority: {
    type: String,
    required: false,
  }
}, { timestamps: true });

module.exports = mongoose.model("News", newsSchema);
