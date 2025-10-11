const Logs = require("../model/Logs");

// GET - Retrieve all logs with optional filtering
const getAllLogs = async (request, response) => {
  try {
    const { action, category, status, userId, startDate, endDate, page = 1, limit = 20 } = request.query;

    // Build filter object
    const filter = {};
    if (action) filter.action = action;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (userId) filter['performedBy'] = userId;
    
    // Date range filter
    if (startDate || endDate) {
      filter.created_at = {};
      if (startDate) filter.created_at.$gte = new Date(startDate);
      if (endDate) filter.created_at.$lte = new Date(endDate);
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination info
    const totalLogs = await Logs.countDocuments(filter);
    const totalPages = Math.ceil(totalLogs / limitNum);

    const allLogs = await Logs.find(filter)
      .sort({ created_at: -1 })
      .populate('performedBy', 'username roles')
      .skip(skip)
      .limit(limitNum);
    
    response.status(200).json({
      success: true,
      count: allLogs.length,
      total: totalLogs,
      currentPage: pageNum,
      totalPages: totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
      data: allLogs
    });
  } catch (error) {
    response.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

module.exports = { getAllLogs };
