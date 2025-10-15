const Logs = require("../model/Logs");

const createLog = async (logData) => {
  const { action, category, title, description, performedBy, targetType, targetId, targetName, details } = logData;
  try {
    await Logs.create({
      action,
      category,
      title,
      description,
      performedBy,
      targetType,
      targetId,
      targetName,
      details: { ...details },
    });
  } catch (error) {
    console.error("Failed to create log entry:", error.message);
  }
};

module.exports = { createLog };
