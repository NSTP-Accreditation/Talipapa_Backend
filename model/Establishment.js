const mongoose = require('mongoose');
const { Schema } = mongoose;


const establishmentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  ownerName: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
}, { timestamps: true });


module.exports = mongoose.model('Establishment', establishmentSchema);