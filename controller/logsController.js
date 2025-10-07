const Logs = require("../model/Logs");

// GET - Retrieve all logs with optional filtering
const getAllLogs = async (request, response) => {
  try {
    const { action, category, status, userId, startDate, endDate } = request.query;
    
    // Build filter object
    const filter = {};
    if (action) filter.action = action;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (userId) filter['performedBy.userId'] = userId;
    
    // Date range filter
    if (startDate || endDate) {
      filter.created_at = {};
      if (startDate) filter.created_at.$gte = new Date(startDate);
      if (endDate) filter.created_at.$lte = new Date(endDate);
    }

    const allLogs = await Logs.find(filter)
      .sort({ created_at: -1 })
      .limit(100);

    response.status(200).json({
      success: true,
      count: allLogs.length,
      data: allLogs
    });
  } catch (error) {
    response.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// POST - Create new log entry
const postLogs = async (request, response) => {
  try {
    const { 
      action, 
      category, 
      title, 
      description, 
      performedBy,
      targetType,
      targetId,
      targetName,
      details,
      ipAddress,
      status
    } = request.body;

    // Validate required fields
    if (!action || !category || !title || !description) {
      return response.status(400).json({ 
        success: false,
        message: "Action, Category, Title and Description are required!" 
      });
    }

    const LogsObject = await Logs.create({
      action,
      category,
      title,
      description,
      performedBy,
      targetType,
      targetId,
      targetName,
      details,
      ipAddress,
      status: status || 'SUCCESS'
    });

    response.status(201).json({
      success: true,
      message: "Log created successfully",
      data: LogsObject
    });
  } catch (error) {
    response.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

module.exports = { getAllLogs, postLogs };
