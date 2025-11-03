const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  roles: {
    SuperAdmin: Number,
    Admin: Number,
    Staff: Number,
  },
  password: {
    type: String,
    required: true,
  },
  refreshToken: String,
});

userSchema.virtual("rolesKeys").get(function () {
  if (!this.roles || typeof this.roles !== "object") {
    return [];
  }

  const roleKeys = [];

  if (this.roles.SuperAdmin) roleKeys.push("SuperAdmin");
  if (this.roles.Admin) roleKeys.push("Admin");
  if (this.roles.Staff) roleKeys.push("Staff");

  return roleKeys;
});

userSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

userSchema.set("toObject", {
  virtuals: true,
});

module.exports = mongoose.model("User", userSchema);
