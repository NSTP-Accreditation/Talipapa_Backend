const mongoose = require('mongoose');
const { Schema } = mongoose;

const newsSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  }, // PUBLISHED OR DRAFT
  content: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date
  }
})

module.exports = mongoose.model('News', newsSchema);