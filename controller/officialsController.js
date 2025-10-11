const Officials = require("../model/Officials");
const officials = require("../model/Officials");
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
      return response.status(400).json({ message: "Name and Position is required!" });

    const foundOfficial = await Officials.findOne({ name });
    if(foundOfficial) return response.status(409).json({ message: `Official ${name} already exists. `});

    const newsObject = await Officials.create({
      name: name,
      position: position,
    });

    // Log official creation
    await createLog({
      action: 'OFFICIAL_CREATE',
      category: 'CONTENT_MANAGEMENT',
      title: 'Official Added',
      description: `Official "${name}" was added with position ${position}`,
      performedBy: request.user,
      targetType: 'OFFICIAL',
      targetId: newsObject._id.toString(),
      targetName: name,
      details: { position },
      ipAddress: request.ip,
      status: 'SUCCESS'
    });

    response.status(201).json(newsObject);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    if (!oldOfficial) return response.status(404).json({ message: `Official not found with ID: ${id}` });

    const updatedObject = await officials.findByIdAndUpdate(
      { _id: id },
      { name: name, position: position, updatedAt: new Date() },
      { new: true }
    );

    // Log official update
    await createLog({
      action: 'OFFICIAL_UPDATE',
      category: 'CONTENT_MANAGEMENT',
      title: 'Official Updated',
      description: `Official "${name}" was updated`,
      performedBy: request.user,
      targetType: 'OFFICIAL',
      targetId: id,
      targetName: name,
      details: {
        before: { name: oldOfficial.name, position: oldOfficial.position },
        after: { name, position }
      },
      ipAddress: request.ip,
      status: 'SUCCESS'
    });

    response.json(updatedObject);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

    // Log official deletion
    await createLog({
      action: 'OFFICIAL_DELETE',
      category: 'CONTENT_MANAGEMENT',
      title: 'Official Deleted',
      description: `Official "${foundObject.name}" was deleted`,
      performedBy: request.user,
      targetType: 'OFFICIAL',
      targetId: id,
      targetName: foundObject.name,
      details: {
        deletedOfficial: {
          name: foundObject.name,
          position: foundObject.position
        }
      },
      ipAddress: request.ip,
      status: 'SUCCESS'
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
