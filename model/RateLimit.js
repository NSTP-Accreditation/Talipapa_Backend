const mongoose = require("mongoose");

const rateLimitSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true, unique: true, index: true },
    attempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    lastAttempt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const RateLimit = mongoose.model("RateLimit", rateLimitSchema);

module.exports = RateLimit;
