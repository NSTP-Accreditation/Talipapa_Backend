const { LOGCONSTANTS } = require('../config/constants');
const Farm = require('../model/Farm');

const getFarms = async (req, res) => {
  try {
    const farms = await Farm.find().lean().exec();
    if(!farms || farms.length === 0) return res.sendStatus(204);
    res.json(farms);
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
};

  
const addFarm = async (req, res) => {
  const { location, name, size, age, farmType, address, description } = req.body;

  if(!location || !name || !size || !age || !farmType || !address || !description) return res.status(400).json({ error: 'All Fields are required!'});
  const parsedLocation = JSON.parse(req.body.location);
  try {
    const newFarm = await Farm.create({
      location: {
        lat: Number(parsedLocation.lat),
        lng: Number(parsedLocation.lng)
      },
      name,
      size,
      age,
      farmType,
      address,
      description,
      // image: req.file ? req.file.filename : ''
    });

    await createLog({
      action: LOGCONSTANTS.actions.farms.CREATE_FARM,
      category: LOGCONSTANTS.categories.GREEN_PAGE,
      title: 'New Farm Created',
      description: `Farm ${name} created successfully`,
      performedBy: req.userId,
      targetType: LOGCONSTANTS.targetTypes.FARM,
      targetId: newFarm._id.toString(),
      targetName: newFarm.name,
    });

    res.status(201).json({ message: 'New Farm Added!'});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateFarm = async (req, res) => {

};

const deleteFarm = async (req, res) => {

};


module.exports = { getFarms, addFarm, updateFarm, deleteFarm };