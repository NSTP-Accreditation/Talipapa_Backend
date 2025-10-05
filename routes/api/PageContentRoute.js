const express = require("express");
const router = express.Router();
const PageContent = require("../../model/PageContent");

// GET all page contents
router
  .route("")
  .get(async (request, response) => {
    try {
      const allContent = await PageContent.find({});

      response.json(allContent);
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  })
  .post(async (request, response) => {
    const { mission, vision } = request.body;

    try {
      const allContent = await PageContent.find({});
      if(allContent.length > 0) {
        if(mission || vision) {
          return response
          .status(400)
          .json({ message: "Mission and Vision content is already defined!" });
        }
      }

      if (!mission || !vision)
        return response
          .status(400)
          .json({ message: "Mission and Vision content are required!" });

      const pageContent = await PageContent.create({
        mission,
        vision,
      });

      response.status(201).json(pageContent);
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  });

router
  .route("/:id")
  .put(async (request, response) => {
    const { id } = request.params;
    const { mission, vision } = request.body;

    if (!id)
      return response.status(400).json({ message: "The ID is required!" });

    try {
      if (!mission || !vision)
        return response
          .status(400)
          .json({ message: "Mission and Vision are required!" });

      const updatedContent = await PageContent.findByIdAndUpdate(
        { _id: id },
        {
          mission,
          vision,
          updated_at: new Date(),
        },
        { new: true }
      );

      response.json(updatedContent);
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  })

module.exports = router;