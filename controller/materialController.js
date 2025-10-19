const { response } = require("express");
const Material = require("../model/Material");
const { createLog } = require("../utils/logHelper");
const { LOGCONSTANTS } = require("../config/constants");
const { deleteFromS3 } = require("../utils/deleteFromS3");

const getMaterials = async (request, response) => {
  try {
    const materials = await Material.find({});

    return response.json(materials);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const createMaterial = async (request, response) => {
  const { name, description, pointsPerKg } = request.body;

  if (!name) {
    return response.status(400).json({ message: "Name is required!" });
  }

  if (!request.file) {
    return response.status(400).json({
      success: false,
      message: "Material image is required",
    });
  }

  try {
    const duplicate = await Material.findOne({ name }).exec();
    if (duplicate) {
      return response
        .status(409)
        .json({ message: `Material ${name} already exists!` });
    }

    let parsedPoints;
    if (pointsPerKg !== undefined && pointsPerKg !== "") {
      parsedPoints = Number(pointsPerKg);
      if (isNaN(parsedPoints) || parsedPoints <= 0) {
        return response
          .status(400)
          .json({ message: "Points Per Kg must be a number greater than 0" });
      }
    }

    const newMaterialData = {
      name,
      description,
      image: {
        url: request.file.location,
        key: request.file.key,
        originalName: request.file.originalname,
        size: request.file.size,
        mimetype: request.file.mimetype,
      },
    };

    if (parsedPoints) {
      newMaterialData.pointsPerKg = parsedPoints;
    }

    const newMaterial = await Material.create(newMaterialData);

    await createLog({
      action: LOGCONSTANTS.actions.materials.CREATE_MATERIAL,
      category: LOGCONSTANTS.categories.INVENTORY,
      title: "New Material Created",
      description: `Material "${name}" was created`,
      performedBy: request.userId,
      targetType: LOGCONSTANTS.targetTypes.MATERIAL,
      targetId: newMaterial._id.toString(),
      targetName: name,
    });

    response.status(201).json({ message: `${newMaterial.name} Added!` });
  } catch (error) {
    console.error("Error creating material:", error);
    response.status(500).json({ error: error.message });
  }
};

const updateMaterial = async (request, response) => {
  const { id } = request.params;

  if (!id)
    return response.status(400).json({ message: "Material ID is required!" });

  const { name, pointsPerKg } = request.body;

  if (!name && !pointsPerKg)
    return response
      .status(400)
      .json({ error: "Atleast one field is required!a" });

  const updateFields = {
    updatedAt: new Date(),
  };
  if (name) updateFields.name = name;
  if (pointsPerKg) updateFields.pointsPerKg = pointsPerKg;

  if (pointsPerKg <= 0)
    return response
      .status(400)
      .json({ message: "Points Per Kg must be a number greater than 0" });

  try {
    const updatedMaterial = await Material.findOneAndUpdate(
      { _id: id },
      { $set: updateFields },
      { new: true }
    ).lean();
    if (!updatedMaterial) {
      return response.status(404).json({ error: "Material not found" });
    }

    await createLog({
      action: LOGCONSTANTS.actions.materials.UPDATE_MATERIAL,
      category: LOGCONSTANTS.categories.INVENTORY,
      title: "Material Updated",
      description: `Material "${name}" was updated`,
      performedBy: request.userId,
      targetType: LOGCONSTANTS.targetTypes.MATERIAL,
      targetId: updatedMaterial._id.toString(),
      targetName: name,
    });

    return response.json(updatedMaterial);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const deleteMaterial = async (request, response) => {
  const { id } = request.params;

  if (!id)
    return response.status(400).json({ message: "Material ID is required!" });

  try {
    const foundMaterial = await Material.findById(id);
    if (!foundMaterial)
      return response.status(404).json({ error: "Material not found" });

    if (foundMaterial.image && foundMaterial.image.key) {
      try {
        await deleteFromS3(foundMaterial.image.key);
      } catch (s3Error) {
        console.error("Failed to delete image from S3:", s3Error);
        
      }
    }

    await createLog({
      action: LOGCONSTANTS.actions.materials.DELETE_MATERIAL,
      category: LOGCONSTANTS.categories.INVENTORY,
      title: "Material Deleted",
      description: `Material "${foundMaterial.name}" was deleted`,
      performedBy: request.userId,
      targetType: LOGCONSTANTS.targetTypes.MATERIAL,
      targetName: foundMaterial.name,
    });

    await Material.findOneAndDelete(id);
    response.json({ message: "Material Deleted Successfully! " });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const deleteAllMaterial = async (request, response) => {
  try {
    const deleted = await Material.deleteMany({});
    response.json(deleted);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

module.exports = {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteAllMaterial,
  deleteMaterial,
};
