const Achievements = require("../model/Achievements");
const { createLog } = require("../utils/logHelper");
const { LOGCONSTANTS } = require("../config/constants");

const getAllAchievements = async (request, response) => {
  try {
    const allAchievements = await Achievements.find({});

    response.status(200).json(allAchievements);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const postAchievements = async (request, response) => {
  const { title, description, link } = request.body;
  if (!title || !description)
    return response
      .status(400)
      .json({ message: "Title and Description are required!" });

  if (!request.file) {
    return response.status(400).json({
      success: false,
      message: "Product image is required",
    });
  }

  try {
    const foundAchievement = await Achievements.findOne({ title }).lean();
    if (foundAchievement)
      return response
        .status(409)
        .json({ message: `Achievement with Title: ${title} already exists.` });

    const achievementsObject = await Achievements.create({
      title: title,
      description: description,
      link: link,
      image: {
        url: request.file.location,
        key: request.file.key,
        originalName: request.file.originalname,
        size: request.file.size,
        mimetype: request.file.mimetype,
      },
    });

    // Log achievement creation
    await createLog({
      action: LOGCONSTANTS.actions.achievements.CREATE_ACHIEVEMENT,
      category: LOGCONSTANTS.categories.CONTENT_MANAGEMENT,
      title: "New Achievement Created",
      description: `Achievement "${title}" was created`,
      performedBy: request.userId,
      targetType: LOGCONSTANTS.targetTypes.ACHIEVEMENT,
      targetId: achievementsObject._id.toString(),
      targetName: title,
      details: { link },
    });

    response.status(201).json(achievementsObject);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const updateAchievements = async (request, response) => {
  const { id } = request.params;

  if (!id) return response.status(400).json({ message: "ID is required!" });
  const { title, description, link } = request.body;
  try {
    if (!title || !description)
      return response
        .status(400)
        .json({ message: "Title and Description are required!" });

    const oldAchievement = await Achievements.findById(id);
    if (!oldAchievement)
      return response
        .status(404)
        .json({ message: `Achievement not found with ID: ${id}` });

    const updateAchievements = await Achievements.findByIdAndUpdate(
      id,
      {
        title: title,
        description: description,
        link: link,
        updatedAt: new Date(),
      },
      { new: true }
    );

    // Log achievement update
    await createLog({
      action: LOGCONSTANTS.actions.achievements.UPDATE_ACHIEVEMENT,
      category: LOGCONSTANTS.categories.CONTENT_MANAGEMENT,
      title: "Achievement Updated",
      description: `Achievement "${title}" was updated`,
      performedBy: request.userId,
      targetType: LOGCONSTANTS.targetTypes.ACHIEVEMENT,
      targetId: id,
      targetName: title,
      details: {
        before: {
          title: oldAchievement.title,
          description: oldAchievement.description,
          link: oldAchievement.link,
        },
        after: { title, description, link },
      },
    });

    response.status(200).json(updateAchievements);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const deleteAchievements = async (request, response) => {
  const { id } = request.params;

  if (!id) return response.status(400).json({ message: "ID is required!" });
  try {
    const foundObject = await Achievements.findById(id);
    if (!foundObject)
      return response
        .status(404)
        .json({ message: `Achievements not found with ID: ${id}` });

    await Achievements.findByIdAndDelete(id);

    await createLog({
      action: LOGCONSTANTS.actions.achievements.DELETE_ACHIEVEMENT,
      category: LOGCONSTANTS.categories.CONTENT_MANAGEMENT,
      title: "Achievement Deleted",
      description: `Achievement "${foundObject.title}" was deleted`,
      performedBy: request.userId,
      targetType: LOGCONSTANTS.targetTypes.ACHIEVEMENT,
      targetId: id,
      targetName: foundObject.title,
      details: {
        deletedAchievement: {
          title: foundObject.title,
          description: foundObject.description,
          link: foundObject.link,
        },
      },
    });

    response
      .status(200)
      .json({ message: "Achievements deleted successfully!" });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllAchievements,
  postAchievements,
  updateAchievements,
  deleteAchievements,
};
