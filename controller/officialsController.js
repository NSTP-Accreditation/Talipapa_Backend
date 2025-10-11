const Officials = require("../model/Officials");
const { LOGCONSTANTS } = require("../config/constants");
const { createLog } = require("../utils/logHelper");

const getAllOfficials = async (request, response) => {
  try {
    const getAllOfficials = await Officials.find({});

    response.json(getAllOfficials);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const postOfficials = async (request, response) => {
  const { name, position } = request.body;

  try {
    if (!name || !position)
      return response
        .status(400)
        .json({ message: "Name and Position is required!" });

    const foundOfficial = await Officials.findOne({ name });
    if (foundOfficial)
      return response
        .status(409)
        .json({ message: `Official ${name} already exists. ` });

    const officialsObject = await Officials.create({
      name: name,
      position: position,
    });

    await createLog({
      action: LOGCONSTANTS.actions.officials.CREATE_OFFICIAL,
      category: LOGCONSTANTS.categories.CONTENT_MANAGEMENT,
      title: "New Official Created",
      description: `Official "${name}" was added with position ${position}`,
      performedBy: request.userId,
    });

    response.status(201).json(officialsObject);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};
const updateOfficials = async (request, response) => {
  const { id } = request.params;

  if (!id) return response.status(400).json({ message: "The ID is required!" });
  const { name, position } = request.body;

  try {
    if (!name || !position)
      return response.status(400).json({ message: "All fields are required!" });

    const oldOfficial = await officials.findById({ _id: id });
    if (!oldOfficial)
      return response
        .status(404)
        .json({ message: `Official not found with ID: ${id}` });

    const updatedObject = await officials.findByIdAndUpdate(
      { _id: id },
      { name: name, position: position, updatedAt: new Date() },
      { new: true }
    );

    await createLog({
      action: LOGCONSTANTS.actions.officials.UPDATE_OFFICIAL,
      category: LOGCONSTANTS.categories.CONTENT_MANAGEMENT,
      title: "Officials Updated",
      description: `Official "${name}" was updated`,
      performedBy: request.userId,
    });

    response.json(updatedObject);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const deleteOfficials = async (request, response) => {
  const { id } = request.params;

  if (!id) return response.status(400).json({ message: "The ID is required!" });

  try {
    const foundObject = await officials.findById({ _id: id });
    if (!foundObject)
      return response
        .status(404)
        .json({ message: `Officials not found with ID: ${id}` });

    await Officials.deleteOne(foundObject);

    await createLog({
      action: LOGCONSTANTS.actions.officials.DELETE_OFFICIAL,
      category: LOGCONSTANTS.categories.CONTENT_MANAGEMENT,
      title: "Official Deleted",
      description: `Official "${foundObject.name}" was deleted`,
      performedBy: request.userId,
    });

    return response.json({ message: "Officials Deleted Successfully" });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllOfficials,
  postOfficials,
  updateOfficials,
  deleteOfficials,
};
