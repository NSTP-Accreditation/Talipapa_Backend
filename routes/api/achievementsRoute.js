const express = require("express");
const router = express.Router();
const Achievements = require("../../model/Achievements");

router
    .route("")
    .get(async (request, response) => {
        try {
            const allAchievements = await Achievements.find({});

            response.status(200).json(allAchievements);
        } catch (error) {
            response.status(500).json({ error: error.message });
        }
    })
    .post(async (request, response) => {
        const { title, description, link } = request.body;
        try {
            if(!title || !description) 
                return response.status(400)
                .json ({ message: "Title and Description are required!"})

            const achievementsObject = await Achievements.create({
                title: title,
                description: description,
                link: link,
            });
            response.status(201).json(achievementsObject);
        } catch (error) {
            response.status(500).json({ error: error.message });
        }

    })

router
  .route("/:id")
  .put(async (request, response) => {

  })
  .delete(async (request, response) => {

  })

module.exports = router;