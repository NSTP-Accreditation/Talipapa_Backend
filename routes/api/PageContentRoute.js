const express = require("express");
const router = express.Router();
const { PageContent, Achievement } = require("../../model/PageContent");

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

  // CREATE new page content
  .post(async (request, response) => {
    const { mission, vision, achievements } = request.body;

    try {
      const allContent = await PageContent.find({});

      if (!mission || !vision)
        return response
          .status(400)
          .json({ message: "Mission and Vision content are required!" });

      const pageContent = await PageContent.create({
        mission,
        vision,
        achievements,
      });

      response.status(201).json(pageContent);
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  });

// UPDATE or DELETE by ID
router
  .route("/:id")
  .put(async (request, response) => {
    const { id } = request.params;
    const { mission, vision, achievements } = request.body;

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
          achievements,
          updated_at: new Date(),
        },
        { new: true }
      );

      response.json(updatedContent);
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  })
  .delete(async (request, response) => {
    const { id } = request.params;

    if (!id)
      return response.status(400).json({ message: "The ID is required!" });

    try {
      const foundContent = await PageContent.findById({ _id: id });
      if (!foundContent)
        return response
          .status(404)
          .json({ message: `PageContent not found with ID: ${id}` });

      await PageContent.deleteOne(foundContent);
      return response.json({ message: "Page content deleted successfully!" });
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  });

module.exports = router;
