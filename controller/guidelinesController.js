const Guideline = require('../model/Guidelines');
const { createLog } = require("../utils/logHelper");

const getAllGuideline = async (request, response) => {
    try {
      const allGuidelines = await Guideline.find({});
      response.json(allGuidelines);
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  }
const postGuideline = async (request, response) => {
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

      // Log guideline creation
      await createLog({
        action: 'GUIDELINE_CREATE',
        category: 'CONTENT_MANAGEMENT',
        title: 'New Guideline Created',
        description: `Guideline "${title}" was created`,
        performedBy: request.user,
        targetType: 'GUIDELINE',
        targetId: newGuideline._id.toString(),
        targetName: title,
        details: { category },
        ipAddress: request.ip,
        status: 'SUCCESS'
      });

      response.status(201).json(newGuideline);
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  }
const updateGuideline = async (request, response) => {
    const { id } = request.params;
    const { category, title, description } = request.body;

    if (!id)
      return response.status(400).json({ message: "The ID is required!" });

    try {
      if (!category || !title || !description)
        return response
          .status(400)
          .json({ message: "Category, Title, and Description are required!" });

      const oldGuideline = await Guideline.findById(id).lean();
      
      const updatedGuideline = await Guideline.findByIdAndUpdate(
        id,
        {
          category,
          title,
          description,
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (!updatedGuideline)
        return response.status(404).json({ message: "Guideline not found!" });

      // Log guideline update
      await createLog({
        action: 'GUIDELINE_UPDATE',
        category: 'CONTENT_MANAGEMENT',
        title: 'Guideline Updated',
        description: `Guideline "${title}" was updated`,
        performedBy: request.user,
        targetType: 'GUIDELINE',
        targetId: id,
        targetName: title,
        details: {
          before: oldGuideline,
          after: { category, title, description }
        },
        ipAddress: request.ip,
        status: 'SUCCESS'
      });

      response.json(updatedGuideline);
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  }
const deleteGuideline = async (request, response) => {
    const { id } = request.params;

    if (!id)
      return response.status(400).json({ message: "The ID is required!" });

    try {
      const deletedGuideline = await Guideline.findByIdAndDelete(id);

      if (!deletedGuideline)
        return response.status(404).json({ message: "Guideline not found!" });

      // Log guideline deletion
      await createLog({
        action: 'GUIDELINE_DELETE',
        category: 'CONTENT_MANAGEMENT',
        title: 'Guideline Deleted',
        description: `Guideline "${deletedGuideline.title}" was deleted`,
        performedBy: request.user,
        targetType: 'GUIDELINE',
        targetId: id,
        targetName: deletedGuideline.title,
        ipAddress: request.ip,
        status: 'SUCCESS'
      });

      response.json({ message: "Guideline deleted successfully!" });
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  }

module.exports = { getAllGuideline, updateGuideline, deleteGuideline, postGuideline };