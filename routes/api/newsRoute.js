const express = require("express");
const router = express.Router();
const News = require("../../model/News");

router
  .route("")
  .get((request, response) => {
    
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
    // 400: Bad request
  });

module.exports = router;
