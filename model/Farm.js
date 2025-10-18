const mongoose = require('mongoose');
const { Schema } = mongoose;

const farmSchema = new Schema({
  location: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  }, 
  name: {
    type: String,
    required: true
  },
  size: {
    type: String,
    required: true
  },
  age: {
    type: String,
    required: true
  },
  farmType: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    url: String,
    key: String,
    originalName: String,
    size: Number,
    mimetype: String,
  },
});

module.exports = mongoose.model('Farm', farmSchema);