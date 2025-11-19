const mongoose = require("mongoose");
const { Schema } = mongoose;

const staffSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  email_address: String,
  position: [
    {
      _id: false,
      id: {
        type: String,
        required: true,
      },
      label: {
        type: String,
        required: true,
      },
    },
  ],
  // Reference to Skill documents instead of embedding
  skills: [
    {
      type: Schema.Types.ObjectId,
      ref: "Skill",
    },
  ],
  contact_number: String,
  // Reference to Farm documents instead of embedded objects
  assigned_farm: [
    {
      type: Schema.Types.ObjectId,
      ref: "Farm",
    },
  ]
}, { timestamps: true });

module.exports = mongoose.model("Staff", staffSchema);
