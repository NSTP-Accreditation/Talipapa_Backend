const mongoose = require("mongoose")
const { Schema } = mongoose;

const itemSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const talipapanatinSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    items: {
        type: [itemSchema],
        default: [],
    },
}, { timestamps: true });

module.exports = mongoose.model("Talipapanatin", talipapanatinSchema)