const mongoose = require('mongoose');
const { Schema } = mongoose;
const Counter = require('./Counter');

const recordSchema = new Schema({
  _id: String,
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  middleName: {
    type: String,
    required: true
  },
  age: {
    type: String,
    required: true
  },
  address: {
    type: String,
  },
  points: {
    type: Number,
    default: 0
  },
  contact_number: String,
}, { timestamps: true });

recordSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'recordId',
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      this._id = `BT-${String((counter.seq)).padStart(4, '0')}`;
      
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Record', recordSchema);