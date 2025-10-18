const Guideline = require("../model/Guidelines");
const { createLog } = require("../utils/logHelper");
const { LOGCONSTANTS } = require("../config/constants");

const getAllGuideline = async (request, response) => {
  try {
    const allGuidelines = await Guideline.find({});
    response.json(allGuidelines);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const getSingleGuideline = async (request, response) => {
  const { id } = request.params;

  if (!id) {
    return response.status(400).json({ message: "The ID is required!" });
  }

  try {
    const guideline = await Guideline.findById(id);

    if (!guideline) {
      return response.status(404).json({ message: "Guideline not found!" });
    }

    response.json(guideline);
  } catch (error) {
    console.error("Error fetching guideline:", error);
    response.status(500).json({ error: error.message });
  }
};

const postGuideline = async (request, response) => {
  const {
    category,
    title,
    description,
    difficulty,
    totalEstimatedTime,
    lastUpdated,
    steps,
  } = request.body;

  try {
    if (!category || !title || !description) {
      return response
        .status(400)
        .json({ message: "Category, Title, and Description are required!" });
    }

    // normalize steps: ensure each step has required fields and arrays are proper
    const normalizedSteps = Array.isArray(steps)
      ? steps.map((s, idx) => ({
          stepNumber: s.stepNumber ?? idx + 1,
          title: s.title || s.stepTitle || `Step ${idx + 1}`,
          description: s.description || "",
          location: s.location || "",
          requiredDocuments: Array.isArray(s.requiredDocuments)
            ? s.requiredDocuments
            : s.requiredDocuments
            ? [s.requiredDocuments]
            : [],
          estimatedTime: s.estimatedTime || s.estimatedTime || "",
          tips: Array.isArray(s.tips) ? s.tips : s.tips ? [s.tips] : [],
        }))
      : [];

    const guidelineData = {
      category,
      title,
      description,
      difficulty,
      totalEstimatedTime,
      lastUpdated: lastUpdated ? new Date(lastUpdated) : undefined,
      steps: normalizedSteps,
    };

    const newGuideline = await Guideline.create(guidelineData);

    // Log guideline creation
    await createLog({
      action: LOGCONSTANTS.actions.guidelines.CREATE_GUIDELINE,
      category: LOGCONSTANTS.categories.CONTENT_MANAGEMENT,
      title: "New Guideline Created",
      description: `Guideline "${title}" was created with ${normalizedSteps.length} steps`,
      performedBy: request.userId,
      targetType: LOGCONSTANTS.targetTypes.GUIDELINE,
      targetId: newGuideline._id.toString(),
      targetName: title,
      details: { category },
    });

    response.status(201).json(newGuideline);
  } catch (error) {
    console.error("Error creating guideline:", error);
    response.status(500).json({ error: error.message });
  }
};

const updateGuideline = async (request, response) => {
  const { id } = request.params;
  const {
    category,
    title,
    description,
    difficulty,
    totalEstimatedTime,
    lastUpdated,
    steps,
  } = request.body;

  if (!id) return response.status(400).json({ message: "The ID is required!" });

  try {
    if (!category || !title || !description)
      return response
        .status(400)
        .json({ message: "Category, Title, and Description are required!" });

    const oldGuideline = await Guideline.findById(id).lean();

    if (!oldGuideline)
      return response.status(404).json({ message: "Guideline not found!" });

    const normalizedSteps = Array.isArray(steps)
      ? steps.map((s, idx) => ({
          stepNumber: s.stepNumber ?? idx + 1,
          title: s.title || s.stepTitle || `Step ${idx + 1}`,
          description: s.description || "",
          location: s.location || "",
          requiredDocuments: Array.isArray(s.requiredDocuments)
            ? s.requiredDocuments
            : s.requiredDocuments
            ? [s.requiredDocuments]
            : [],
          estimatedTime: s.estimatedTime || "",
          tips: Array.isArray(s.tips) ? s.tips : s.tips ? [s.tips] : [],
        }))
      : oldGuideline.steps || [];

    const updateData = {
      category,
      title,
      description,
      difficulty,
      totalEstimatedTime,
      lastUpdated: lastUpdated ? new Date(lastUpdated) : new Date(),
      steps: normalizedSteps,
      updatedAt: new Date(),
    };

    const updatedGuideline = await Guideline.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    await createLog({
      action: LOGCONSTANTS.actions.guidelines.UPDATE_GUIDELINE,
      category: LOGCONSTANTS.categories.CONTENT_MANAGEMENT,
      title: "Guideline Updated",
      description: `Guideline "${title}" was updated`,
      performedBy: request.userId,
      targetType: LOGCONSTANTS.targetTypes.GUIDELINE,
      targetId: updatedGuideline._id.toString(),
      targetName: title,
      details: { category },
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
      performedBy: request.userId,
      targetType: LOGCONSTANTS.targetTypes.GUIDELINE,
      targetId: deletedGuideline._id.toString(),
      targetName: deletedGuideline.title,
      details: { category: deletedGuideline.category },
    });

    response.json({ message: "Guideline deleted successfully!" });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllGuideline,
  getSingleGuideline,
  updateGuideline,
  deleteGuideline,
  postGuideline,
};
