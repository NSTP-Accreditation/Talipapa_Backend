const express = require("express");
const router = express.Router();
const PageContent = require("../../model/PageContent");
const mongoose = require('mongoose');

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

router.delete(("/:id/:achievementId"), async (request, response) => {
    const { id, achievementId } = request.params;

    if (!achievementId)
      return response.status(400).json({ message: "The ID is required!" });

    try {
      const pageContentId = new mongoose.Types.ObjectId(id);
      const achievementIdObj = new mongoose.Types.ObjectId(achievementId);

      const foundContent = await PageContent.findOne({ _id: pageContentId });

      if (!foundContent) {
        return response.status(404).json({ message: `PageContent not found with ID: ${id}` });
      }

      const newAchievements = foundContent.achievements.filter(achiv => 
        !achiv._id.equals(achievementIdObj)
      );
      
      foundContent.achievements = newAchievements;
      await foundContent.save();

      return response.json({ message: "Achievement deleted successfully!" });
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  });

module.exports = router;
