const express = require("express");
const router = express.Router();
const Guideline = require("../../model/Guidelines");

// GET all guidelines
// CREATE a new guideline
router
  .route("")
  // GET all
  .get(async (request, response) => {
    try {
      const allGuidelines = await Guideline.find({});
      response.json(allGuidelines);
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  })

  // POST new guideline
  .post(async (request, response) => {
    const { category, title, description } = request.body;

    try {
      if (!category || !title || !description) {
        return response
          .status(400)
          .json({ message: "Category, Title, and Description are required!" });
      }

      const newGuideline = await Guideline.create({
        category,
        title,
        description,
      });

      response.status(201).json(newGuideline);
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  });

// UPDATE a guideline
// DELETE a guideline
router
  .route("/:id")
  // PUT update
  .put(async (request, response) => {
    const { id } = request.params;
    const { category, title, description } = request.body;

    if (!id)
      return response.status(400).json({ message: "The ID is required!" });

    try {
      if (!category || !title || !description)
        return response
          .status(400)
          .json({ message: "Category, Title, and Description are required!" });

      const updatedGuideline = await Guideline.findByIdAndUpdate(
        id,
        {
          category,
          title,
          description,
          updated_at: new Date(),
        },
        { new: true }
      );

      if (!updatedGuideline)
        return response.status(404).json({ message: "Guideline not found!" });

      response.json(updatedGuideline);
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  })

  // DELETE guideline
  .delete(async (request, response) => {
    const { id } = request.params;

    if (!id)
      return response.status(400).json({ message: "The ID is required!" });

    try {
      const deletedGuideline = await Guideline.findByIdAndDelete(id);

      if (!deletedGuideline)
        return response.status(404).json({ message: "Guideline not found!" });

      response.json({ message: "Guideline deleted successfully!" });
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  });

module.exports = router;
