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
  const { title, status, content } = request.body;

  try {
    if (!title || !status || !content)
      return response.status(400).json({ message: "All fields are required!" });

    const newsObject = await News.create({
      title: title,
      status: status,
      content: content,
    });

    await createLog({
      action: LOGCONSTANTS.actions.news.CREATE_NEWS,
      category: LOGCONSTANTS.categories.CONTENT_MANAGEMENT,
      title: "New News Created",
      description: `News article "${title}" was ${status === 'PUBLISHED' ? 'published' : 'created as draft'}`,
      performedBy: request.userId,

    });

    response.status(201).json(newsObject);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};
const updateNews = async (request, response) => {
  const { id } = request.params;

  if (!id) return response.status(400).json({ message: "The ID is required!" });
  const { title, status, content } = request.body;

  try {
    if (!title || !status || !content)
      return response.status(400).json({ message: "All fields are required!" });

    const oldNews = await News.findById(id).lean();

    const updatedObject = await News.findByIdAndUpdate(
      { _id: id },
      { title: title, status: status, content: content, updatedAt: new Date() },
      { new: true }
    );

    await createLog({
      action: LOGCONSTANTS.actions.news.UPDATE_NEWS,
      category: LOGCONSTANTS.categories.CONTENT_MANAGEMENT,
      title: "News Updated",
      description: `News article "${title}" was updated`,
      performedBy: request.userId,

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
    });

    return response.json({ message: "News Deleted Successfully" });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

module.exports = { getAllNews, postNews, updateNews, deleteNews };
