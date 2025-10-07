const mongoose = require("mongoose");
const { Schema } = mongoose;

const logsSchema = new Schema({
  // Action type
  action: {
    type: String,
    required: true,
  },
  
  // Category for grouping logs
  category: {
    type: String,
    required: true,
  },
  
  // User who performed the action
  performedBy: {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    role: String
  },
  
  // Target of the action
  targetType: {
    type: String,
  },
  
  targetId: {
    type: String,
  },
  
  targetName: {
    type: String,
  },
  
  // Log details
  title: {
    type: String,
    required: true,
  },
  
  description: {
    type: String,
    required: true,
  },
  
  // Additional data
  details: {
    type: Schema.Types.Mixed,
  },
  
  // Request info
  ipAddress: {
    type: String,
  },
  
  // Status
  status: {
    type: String,
    default: 'SUCCESS',
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