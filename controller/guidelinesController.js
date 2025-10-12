const Guideline = require("../model/Guidelines");
const { createLog } = require("../utils/logHelper");
const { LOGCONSTANTS } = require('../config/constants');

const getAllGuideline = async (request, response) => {
  try {
    const allGuidelines = await Guideline.find({});
    response.json(allGuidelines);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};
const postGuideline = async (request, response) => {

  const { category, title, description, difficultyLevel, totalEstimatedTime, steps } = request.body;

  try {
    if (!category || !title || !description) {
      return response
        .status(400)
        .json({ message: "Category, Title, and Description are required!" });
    }

    const guidelineData = {
      category,
      title,
      description,
      difficultyLevel,
      totalEstimatedTime,
      steps: steps || []
    };

    const newGuideline = await Guideline.create(guidelineData);

    // Log guideline creation
    await createLog({
      action: LOGCONSTANTS.actions.guidelines.CREATE_GUIDELINE,
      category: LOGCONSTANTS.categories.CONTENT_MANAGEMENT,
      title: "New Guideline Created",
      description: `Guideline "${title}" was created with ${steps?.length || 0} steps`,
      performedBy: request.user,
      targetType: 'GUIDELINE',
      targetId: newGuideline._id.toString(),
      targetName: title,
      details: { category, difficultyLevel, totalEstimatedTime, stepsCount: steps?.length || 0 },
      ipAddress: request.ip,
      status: 'SUCCESS'
    });

    response.status(201).json(newGuideline);
  } catch (error) {
    console.error('Error creating guideline:', error);
    response.status(500).json({ error: error.message });
  }
};
const updateGuideline = async (request, response) => {
  const { id } = request.params;
  const { category, title, description, difficultyLevel, totalEstimatedTime, steps } = request.body;

  if (!id) return response.status(400).json({ message: "The ID is required!" });

  try {
    if (!category || !title || !description)
      return response
        .status(400)
        .json({ message: "Category, Title, and Description are required!" });

    const oldGuideline = await Guideline.findById(id).lean();

    if (!oldGuideline)
      return response.status(404).json({ message: "Guideline not found!" });

    const updateData = {
      category,
      title,
      description,
      difficultyLevel,
      totalEstimatedTime,
      steps: steps !== undefined ? steps : oldGuideline.steps,
      updatedAt: new Date(),
    };

    const updatedGuideline = await Guideline.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    // Log guideline update
    await createLog({
      action: LOGCONSTANTS.actions.guidelines.UPDATE_GUIDELINE,
      category: LOGCONSTANTS.categories.CONTENT_MANAGEMENT,
      title: "Guideline Updated",
      description: `Guideline "${title}" was updated`,
      performedBy: request.user,
      targetType: 'GUIDELINE',
      targetId: id,
      targetName: title,
      details: {
        before: {
          category: oldGuideline.category,
          title: oldGuideline.title,
          description: oldGuideline.description,
          stepsCount: oldGuideline.steps?.length || 0
        },
        after: {
          category,
          title,
          description,
          stepsCount: steps?.length || 0
        }
      },
      ipAddress: request.ip,
      status: 'SUCCESS'
    });

    response.json(updatedGuideline);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};
const deleteGuideline = async (request, response) => {
  const { id } = request.params;

  if (!id) return response.status(400).json({ message: "The ID is required!" });

  try {
    const deletedGuideline = await Guideline.findByIdAndDelete(id);

    if (!deletedGuideline)
      return response.status(404).json({ message: "Guideline not found!" });

    await createLog({
      action: LOGCONSTANTS.actions.guidelines.DELETE_GUIDELINE,
      category: LOGCONSTANTS.categories.CONTENT_MANAGEMENT,
      title: "Guideline Deleted",
      description: `Guideline "${deletedGuideline.title}" was deleted`,
    });

    response.json({ message: "Guideline deleted successfully!" });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllGuideline,
  updateGuideline,
  deleteGuideline,
  postGuideline,
};
