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
      created_at: {
        type: Date,
        default: Date.now,
      },
      updated_at: {
        type: Date,
      },
});
module.exports = mongoose.model("Achievements", achievementsSchema);