const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  address: {
    type: String,
    // required: true
  },
  roles: {
    Admin: {
      type: Number,
      default: 92781
    },
    Editor: Number
  },
  password: {
    type: String,
    required: true
  },
  refreshToken: String
})

module.exports = mongoose.model("User", userSchema);