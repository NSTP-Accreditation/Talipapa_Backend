const News = require("../model/News");
const { createLog } = require("../utils/logHelper");
const { LOGCONSTANTS } = require("../config/constants");

const getAllNews = async (request, response) => {
  try {
    const allNews = await News.find({});

    response.json(allNews);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const postNews = async (request, response) => {
  const { title, description, dateTime, location, category, priority } = request.body;

  try {
    if (!title || !description || !dateTime || !location || !category || !priority)
      return response.status(400).json({ message: "Missing required fields: title, description, dateTime" });

    const newsObject = await News.create({
      title: title,
      description: description,
      dateTime: new Date(dateTime),
      location: location,
      category: category,
      priority: priority,
    });

    await createLog({
      action: LOGCONSTANTS.actions.news.CREATE_NEWS,
      category: LOGCONSTANTS.categories.CONTENT_MANAGEMENT,
      title: "New News Created",
      description: `News article "${title}" was created`,
      performedBy: request.userId,
      targetType: LOGCONSTANTS.targetTypes.NEWS,
      targetId: newsObject._id.toString(),
      targetName: title,
      details: { category },
    });

    response.status(201).json(newsObject);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};
const updateNews = async (request, response) => {
  const { id } = request.params;

  if (!id) return response.status(400).json({ message: "The ID is required!" });
  const { title, description, dateTime, location, category, priority } = request.body;

  try {
    if (!title || !description || !dateTime || !category || !priority)
      return response.status(400).json({ message: "Missing required fields: title, description, dateTime" });

    const oldNews = await News.findById(id).lean();

    const updatedObject = await News.findByIdAndUpdate(
      { _id: id },
      {
        title: title,
        description: description,
        dateTime: new Date(dateTime),
        location: location,
        category: category,
        priority: priority,
        updatedAt: new Date(),
      },
      { new: true }
    );

    await createLog({
      action: LOGCONSTANTS.actions.news.UPDATE_NEWS,
      category: LOGCONSTANTS.categories.CONTENT_MANAGEMENT,
      title: "News Updated",
      description: `News article "${title}" was updated`,
      performedBy: request.userId,
      targetType: LOGCONSTANTS.targetTypes.NEWS,
      targetId: newsObject._id.toString(),
      targetName: title,
      details: { category },
    });

    response.json(updatedObject);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const deleteNews = async (request, response) => {
  const { id } = request.params;

  if (!id) return response.status(400).json({ message: "The ID is required!" });

  try {
    const foundObject = await News.findById({ _id: id });
    if (!foundObject)
      return response
        .status(404)
        .json({ message: `News not found with ID: ${id}` });

    await News.deleteOne(foundObject);

    await createLog({
      action: LOGCONSTANTS.actions.news.DELETE_NEWS,
      category: LOGCONSTANTS.categories.CONTENT_MANAGEMENT,
      title: "News Deleted",
      description: `News article "${foundObject.title}" was deleted`,
      performedBy: request.userId,
      targetType: LOGCONSTANTS.targetTypes.NEWS,
      targetId: foundObject._id.toString(),
      targetName: foundObject.title,
      details: { category: foundObject.category },
    });

    return response.json({ message: "News Deleted Successfully" });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

module.exports = { getAllNews, postNews, updateNews, deleteNews };
  