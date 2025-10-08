const { response } = require('express');
const Material = require('../model/Material');

const getMaterials = async (request, response) => {
  try {
    const materials = await Material.find({});

    return response.json(materials);
  } catch (error) {
    response.status(500).json({ error: error.message });    
  }
};

const createMaterial = async (request, response) => {
  const { name, pointsPerKg } = request.body;

  if (!name) {
    return response.status(400).json({ message: 'Name is required!' });
  }

  try {
    const duplicate = await Material.findOne({ name }).exec();
    if (duplicate) {
      return response.status(409).json({ message: `Product ${name} already exists!` });
    }

    let parsedPoints;
    if (pointsPerKg !== undefined && pointsPerKg !== '') {
      parsedPoints = Number(pointsPerKg);
      if (isNaN(parsedPoints) || parsedPoints <= 0) {
        return response.status(400).json({ message: "Points Per Kg must be a number greater than 0" });
      }
    }

    const newMaterialData = {
      name,
      // image: req.file ? req.file.filename : ''
    };

    if (parsedPoints) {
      newMaterialData.pointsPerKg = parsedPoints;
    }

    const newMaterial = await Material.create(newMaterialData);

    response.status(201).json({ message: `${newMaterial.name} Added!` });
  } catch (error) {
    console.error('Error creating material:', error);
    response.status(500).json({ error: error.message });
  }
};


const updateMaterial = async (request, response) => {
  const { id } = request.params

  if(!id) return response.status(400).json({ message: "Material ID is required!"});

  const { name, pointsPerKg } = request.body;

  if(!name && !pointsPerKg) return response.status(400).json({ error: "Atleast one field is required!a"});
  
  const updateFields = {
    updatedAt: new Date()
  };
  if(name) updateFields.name = name;
  if(pointsPerKg) updateFields.pointsPerKg = pointsPerKg;

  if(pointsPerKg <= 0) return response.status(400).json({ message: "Points Per Kg must be a number greater than 0" });

  try {
    const updatedMaterial = await Material.findOneAndUpdate({ _id: id }, { $set: updateFields }, { new: true }).lean();
    if (!updatedMaterial) {
      return response.status(404).json({ error: "Material not found" });
    }

    return response.json(updatedMaterial);
  } catch (error) {
    response.status(500).json({ error: error.message });    
  }
};

const deleteMaterial = async (request, response) => {
  const { id } = request.params;
  
  if(!id) return response.status(400).json({ message: "Material ID is required!"});

  try {
    const foundProduct = await Material.findById(id);
    if(!foundProduct) return response.status(404).json({ error: "Material not found" });

    response.json({ message: "Material Deleted Successfully! "});
  } catch (error) {
    response.status(500).json({ error: error.message });  
  }
}

const deleteAllMaterial = async (request, response) => {
  try {
    const deleted = await Material.deleteMany({});
    response.json(deleted);
  } catch (error) {
    response.status(500).json({ error: error.message });    
  }
}

module.exports = { getMaterials, createMaterial, updateMaterial, deleteAllMaterial, deleteMaterial };