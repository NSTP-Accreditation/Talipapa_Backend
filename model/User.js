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
  roles: {
    SuperAdmin: Number,
    Admin: Number,
  },
  password: {
    type: String,
    required: true
  },
  refreshToken: String
})

module.exports = mongoose.model("User", userSchema);