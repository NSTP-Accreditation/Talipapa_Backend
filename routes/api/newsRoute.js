const express = require("express");
const router = express.Router();
const News = require("../../model/News");

router
  .route("")
  .get(async (request, response) => {
    try {
      const allNews = await News.find({});

      response.json(allNews);
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  })
  .post(async (request, response) => {
    const { title, status, content } = request.body;

    try {
      if (!title || !status || !content)
        return response
          .status(400)
          .json({ message: "All fields are required!" });

      const newsObject = await News.create({
        title: title,
        status: status,
        content: status,
      });

      response.status(201).json(newsObject);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })

router
  .route("/:id")
  .put(async (request, response) => {
    const { id } = request.params;

    if(!id) return response.status(400).json({ message: "The ID is required!"});
    const { title, status, content } = request.body; 
    
    try {
      if (!title || !status || !content)
        return response
          .status(400)
          .json({ message: "All fields are required!" });

      const updatedObject = await News.findByIdAndUpdate({ _id: id }, { title: title, status: status, content: content, updated_at: new Date() }, { new: true });

      response.json(updatedObject);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
  .delete(async (request, response) => {
    const { id } = request.params;

    if(!id) return response.status(400).json({ message: "The ID is required!"});

    try {
      const foundObject = await News.findById({ _id: id });
      if(!foundObject) return response.status(404).json({ message: `News not found with ID: ${id}`});

      await News.deleteOne(foundObject);
      return response.json({ message: "News Deleted Successfully"});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

module.exports = router;
