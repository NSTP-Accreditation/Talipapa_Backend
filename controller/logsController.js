const Logs = require("../model/Logs");

const getAllLogs = async (request, response) => {
  try {
    const { action, category, status, userId, startDate, endDate } =
      request.query;

    // Build filter object
    const filter = {};
    if (action) filter.action = action;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (userId) filter["performedBy"] = userId;

    // Date range filter
    if (startDate || endDate) {
      filter.created_at = {};
      if (startDate) filter.created_at.$gte = new Date(startDate);
      if (endDate) filter.created_at.$lte = new Date(endDate);
    }

    const allLogs = await Logs.find(filter)
      .sort({ created_at: -1 })
      .populate("performedBy", "username roles");

    response.status(200).json(allLogs);
  } catch (error) {
    response.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// GET - Retrieve all logs with optional filtering
const getAllLogsPaginated = async (request, response) => {
  try {
    const {
      action,
      category,
      status,
      userId,
      startDate,
      endDate,
      sort = 'desc', // default sort direction
      page = 1,
      limit = 20,
    } = request.query;

    // Build filter object
    const filter = {};
    if (action) filter.action = action;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (userId) filter["performedBy"] = userId;

    // Date range filter
    if (startDate || endDate) {
      filter.created_at = {};
      if (startDate) filter.created_at.$gte = new Date(startDate);
      if (endDate) filter.created_at.$lte = new Date(endDate);
    }

    // Pagination setup
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sorting setup
    const sortDirection = sort.toLowerCase() === 'asc' ? 1 : -1;

    // Count for pagination
    const totalLogs = await Logs.countDocuments(filter);
    const totalPages = Math.ceil(totalLogs / limitNum);

    // Query logs with sorting + pagination
    const allLogs = await Logs.find(filter)
      .sort({ created_at: sortDirection }) // ✅ dynamic sorting
      .populate("performedBy", "username roles")
      .skip(skip)
      .limit(limitNum);

    // Transform roles
    const transformedLogs = allLogs.map(log => {
      if (log.performedBy && log.performedBy.roles) {
        const logObj = log.toObject();
        logObj.performedBy.roles = Object.keys(log.performedBy.roles).filter(
          role => log.performedBy.roles[role] !== null && log.performedBy.roles[role] !== undefined
        );
        return logObj;
      }
      return log;
    });

    response.status(200).json({
      success: true,
      count: transformedLogs.length,
      total: totalLogs,
      currentPage: pageNum,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
      sort: sort.toUpperCase(),
      data: transformedLogs,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


module.exports = { getAllLogs, getAllLogsPaginated };
