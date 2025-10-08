const mongoose = require("mongoose");
const { Schema } = mongoose;

const achievementsSchema = new Schema({
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      link: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
      },
});
module.exports = mongoose.model("Achievements", achievementsSchema);