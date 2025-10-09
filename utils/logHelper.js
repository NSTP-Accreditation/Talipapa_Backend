const Logs = require("../model/Logs");

/**
 * Create a log entry in the database
 * @param {Object} logData - Log data object
 * @param {string} logData.action - Action performed (e.g., 'LOGIN', 'CREATE', 'UPDATE')
 * @param {string} logData.category - Category (e.g., 'AUTHENTICATION', 'INVENTORY')
 * @param {string} logData.title - Log title
 * @param {string} logData.description - Log description
 * @param {string} [logData.performedBy] - User ID who performed the action
 * @param {string} [logData.targetType] - Type of target (e.g., 'PRODUCT', 'NEWS')
 * @param {string} [logData.targetId] - ID of the target
 * @param {string} [logData.targetName] - Name of the target
 * @param {Object} [logData.details] - Additional details
 * @param {string} [logData.status='SUCCESS'] - Status of the action
 * @param {string} [logData.ipAddress] - IP address of the request
 */
const createLog = async (logData) => {
  try {
    const log = {
      action: logData.action,
      category: logData.category,
      title: logData.title,
      description: logData.description,
      targetType: logData.targetType,
      targetId: logData.targetId,
      targetName: logData.targetName,
      details: logData.details,
      status: logData.status || 'SUCCESS',
      ipAddress: logData.ipAddress
    };

    if (logData.performedBy) {
      log.performedBy = logData.performedBy;
    }

    await Logs.create(log);
  } catch (error) {
    console.error('Failed to create log entry:', error.message);
  }
};

module.exports = { createLog };
