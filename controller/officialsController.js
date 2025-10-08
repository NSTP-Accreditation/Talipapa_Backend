const Officials = require("../model/Officials");
const officials = require("../model/Officials");

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

    const updatedObject = await officials.findByIdAndUpdate(
      { _id: id },
      { name: name, position: position, updatedAt: new Date() },
      { new: true }
    );

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
