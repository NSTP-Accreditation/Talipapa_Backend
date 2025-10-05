const Achievements = require("../model/Achievements");
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

        const updateAchievements = await Achievements.findByIdAndUpdate({ _id: id}, { title: title, description: description, link: link, updated_at: new Date() }, { new: true});
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
        response.status(200).json({ message: "Achievements deleted successfully!" });

    } catch (error) {
        
    } 
}

module.exports = { getAllAchievements, postAchievements, updateAchievements, deleteAchievements };
