const Skills = require("../model/Skills");
const { LOGCONSTANTS } = require("../config/constants");
const { createLog } = require("../utils/logHelper");

const getAllSkills = async (request, response) => {
  try {
    const getAllSkills = await Skills.find({});

    response.json(getAllSkills);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const postSkills = async (request, response) => {
  const { name, short, type } = request.body;

  try {
    if (!name || !short || !type)
      return response.status(400).json({ message: "All field are required!" });

    const foundSkill = await Skills.findOne({ name });
    if (foundSkill)
      return response
        .status(409)
        .json({ message: `Skill ${name} already exists. ` });

    const skillsObject = await Skills.create({
      name: name,
      short: short,
      type: type,
    });

    await createLog({
      action: LOGCONSTANTS.actions.skills.CREATE_SKILL,
      category: LOGCONSTANTS.categories.GREEN_PAGE,
      title: "New Skills Created",
      description: `Skill "${name}" was added with type ${type}.`,
      performedBy: request.userId,
    });

    response.status(201).json(skillsObject);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};
const updateSkills = async (request, response) => {
  const { id } = request.params;

  if (!id) return response.status(400).json({ message: "The ID is required!" });
  const { name, short, type } = request.body;

  try {
    if (!name || !short || !type)
      return response.status(400).json({ message: "All fields are required!" });

    const oldSkill = await Skills.findById({ _id: id });
    if (!oldSkill)
      return response
        .status(404)
        .json({ message: `Skills not found with ID: ${id}` });

    const updatedObject = await Skills.findByIdAndUpdate(
      { _id: id },
      { name: name, short: short, type: type, updatedAt: new Date() },
      { new: true }
    );

    await createLog({
      action: LOGCONSTANTS.actions.skills.UPDATE_SKILL,
      category: LOGCONSTANTS.categories.GREEN_PAGE,
      title: "Skills Updated",
      description: `Skills "${name}" was updated`,
      performedBy: request.userId,
    });

    response.json(updatedObject);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const deleteSkills = async (request, response) => {
  const { id } = request.params;

  if (!id) return response.status(400).json({ message: "The ID is required!" });

  try {
    const foundObject = await Skills.findById({ _id: id });
    if (!foundObject)
      return response
        .status(404)
        .json({ message: `Skills not found with ID: ${id}` });

    await Skills.deleteOne(foundObject);

    await createLog({
      action: LOGCONSTANTS.actions.skills.DELETE_SKILL,
      category: LOGCONSTANTS.categories.GREEN_PAGE,
      title: "Skills Deleted",
      description: `Skills "${foundObject.name}" was deleted`,
      performedBy: request.userId,
    });

    return response.json({ message: "Skills Deleted Successfully" });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllSkills,
  postSkills,
  updateSkills,
  deleteSkills,
};
