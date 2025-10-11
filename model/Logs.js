const mongoose = require("mongoose");
const { Schema } = mongoose;

const logsSchema = new Schema({
  
  // Action type
  action: {
    type: String,
    required: true,
  },

  title: {
    type: String,
    required: true
  },
  
  // Description of the action
  description: {
    type: String,
    required: true,
  },

  // Category for grouping logs Ex: Enum: { Authentication, USER_MANAGEMENT, RECORD_MANAGEMENT, INVENTORY, CONTENT_MANAGEMENT }
  category: {
    type: String,
    required: true,
  },

  // User who performed the action
  performedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  
  // Timestamps
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Index for better query performance
logsSchema.index({ created_at: -1 });
logsSchema.index({ category: 1, created_at: -1 });
logsSchema.index({ action: 1, created_at: -1 });

module.exports = mongoose.model("Logs", logsSchema);