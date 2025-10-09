const Achievements = require("../model/Achievements");
const { createLog } = require("../utils/logHelper");

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
  try {
    if (!title || !description)
      return response
        .status(400)
        .json({ message: "Title and Description are required!" });
    
    const achievementsObject = await Achievements.create({
      title: title,
      description: description,
      link: link,
    });

    // Log achievement creation
    await createLog({
      action: 'ACHIEVEMENT_CREATE',
      category: 'CONTENT_MANAGEMENT',
      title: 'New Achievement Created',
      description: `Achievement "${title}" was created`,
      performedBy: request.user,
      targetType: 'ACHIEVEMENT',
      targetId: achievementsObject._id.toString(),
      targetName: title,
      details: { link },
      ipAddress: request.ip,
      status: 'SUCCESS'
    });
    
    response.status(201).json(achievementsObject);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const updateAchievements = async (request, response) => {
    const { id } = request.params;

    if(!id) return response.status(400).json({ message: "ID is required!"})
    const { title, description, link } = request.body;
    try {
        if (!title || !description)
        return response
            .status(400)
            .json({ message: "Title and Description are required!" });

        const oldAchievement = await Achievements.findById({ _id: id });
        if (!oldAchievement) return response.status(404).json({ message: `Achievement not found with ID: ${id}` });

        const updateAchievements = await Achievements.findByIdAndUpdate({ _id: id}, { title: title, description: description, link: link, updatedAt: new Date() }, { new: true});

        // Log achievement update
        await createLog({
          action: 'ACHIEVEMENT_UPDATE',
          category: 'CONTENT_MANAGEMENT',
          title: 'Achievement Updated',
          description: `Achievement "${title}" was updated`,
          performedBy: request.user,
          targetType: 'ACHIEVEMENT',
          targetId: id,
          targetName: title,
          details: {
            before: { title: oldAchievement.title, description: oldAchievement.description, link: oldAchievement.link },
            after: { title, description, link }
          },
          ipAddress: request.ip,
          status: 'SUCCESS'
        });

        response.status(200).json(updateAchievements);

    } catch (error) {
        response.status(500).json({ error: error.message });
    }
};

const deleteAchievements = async (request, response) => {
    const { id } = request.params;

    if(!id) return response.status(400).json({ message: "ID is required!"});
    try {
        const foundObject = await Achievements.findById({ _id: id});
        if(!foundObject) return response.status(404).json({ message: `Achievements not found with ID: ${id}`});

        await Achievements.findByIdAndDelete({ _id: id});

        // Log achievement deletion
        await createLog({
          action: 'ACHIEVEMENT_DELETE',
          category: 'CONTENT_MANAGEMENT',
          title: 'Achievement Deleted',
          description: `Achievement "${foundObject.title}" was deleted`,
          performedBy: request.user,
          targetType: 'ACHIEVEMENT',
          targetId: id,
          targetName: foundObject.title,
          details: {
            deletedAchievement: {
              title: foundObject.title,
              description: foundObject.description,
              link: foundObject.link
            }
          },
          ipAddress: request.ip,
          status: 'SUCCESS'
        });

        response.status(200).json({ message: "Achievements deleted successfully!" });

    } catch (error) {
        response.status(500).json({ error: error.message });
    } 
}

module.exports = { getAllAchievements, postAchievements, updateAchievements, deleteAchievements };
