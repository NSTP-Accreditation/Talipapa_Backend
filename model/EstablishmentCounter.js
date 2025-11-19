const mongoose = require('mongoose');
const { Schema } = mongoose;

const establishmentCounterSchema = new Schema({
  _id: {
    type: String,
    required: true,
    default: 'establishmentId',
  },
  seq: {
    type: Number,
    default: 1000
  }
});

module.exports = mongoose.model('EstablishmentCounter', establishmentCounterSchema);