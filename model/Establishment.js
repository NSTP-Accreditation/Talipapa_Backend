const mongoose = require('mongoose');
const EstablishmentCounter = require('./EstablishmentCounter');
const { Schema } = mongoose;

const establishmentSchema = new Schema({
  _id: String,
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

establishmentSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      const counter = await EstablishmentCounter.findByIdAndUpdate(
        'establishmentId',
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      this._id = `BTE-${String((counter.seq)).padStart(4, '0')}`;
      
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Establishment', establishmentSchema);