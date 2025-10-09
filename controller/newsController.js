const News = require("../model/News");
const { createLog } = require("../utils/logHelper");

const getAllNews = async (request, response) => {
    try {
      const allNews = await News.find({});

      response.json(allNews);
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  }

const postNews = async (request, response) => {
    const { title, status, content } = request.body;

    try {
      if (!title || !status || !content)
        return response
          .status(400)
          .json({ message: "All fields are required!" });

      const newsObject = await News.create({
        title: title,
        status: status,
        content: content,
      });

      // Log news creation
      await createLog({
        action: status === 'PUBLISHED' ? 'NEWS_PUBLISH' : 'NEWS_CREATE',
        category: 'CONTENT_MANAGEMENT',
        title: 'News Article Created',
        description: `News article "${title}" was ${status === 'PUBLISHED' ? 'published' : 'created as draft'}`,
        performedBy: request.user,
        targetType: 'NEWS',
        targetId: newsObject._id.toString(),
        targetName: title,
        details: { status },
        ipAddress: request.ip,
        status: 'SUCCESS'
      });

      response.status(201).json(newsObject);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
const updateNews = async (request, response) => {
    const { id } = request.params;

    if(!id) return response.status(400).json({ message: "The ID is required!"});
    const { title, status, content } = request.body; 
    
    try {
      if (!title || !status || !content)
        return response
          .status(400)
          .json({ message: "All fields are required!" });

      const oldNews = await News.findById(id).lean();
      
      const updatedObject = await News.findByIdAndUpdate({ _id: id }, { title: title, status: status, content: content, updatedAt: new Date() }, { new: true });

      // Log news update
      await createLog({
        action: 'NEWS_UPDATE',
        category: 'CONTENT_MANAGEMENT',
        title: 'News Article Updated',
        description: `News article "${title}" was updated`,
        performedBy: request.user,
        targetType: 'NEWS',
        targetId: id,
        targetName: title,
        details: {
          before: oldNews,
          after: { title, status, content }
        },
        ipAddress: request.ip,
        status: 'SUCCESS'
      });

      response.json(updatedObject);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

const deleteNews = async (request, response) => {
    const { id } = request.params;

    if(!id) return response.status(400).json({ message: "The ID is required!"});

    try {
      const foundObject = await News.findById({ _id: id });
      if(!foundObject) return response.status(404).json({ message: `News not found with ID: ${id}`});

      await News.deleteOne(foundObject);

      // Log news deletion
      await createLog({
        action: 'NEWS_DELETE',
        category: 'CONTENT_MANAGEMENT',
        title: 'News Article Deleted',
        description: `News article "${foundObject.title}" was deleted`,
        performedBy: request.user,
        targetType: 'NEWS',
        targetId: id,
        targetName: foundObject.title,
        ipAddress: request.ip,
        status: 'SUCCESS'
      });

      return response.json({ message: "News Deleted Successfully"});
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  }

module.exports = { getAllNews, postNews, updateNews, deleteNews };