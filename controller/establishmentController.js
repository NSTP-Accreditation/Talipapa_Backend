const Establishment = require('../model/Establishment');

const getAllEstablishments = async (request, response) => {
  try {
    const establishments = await Establishment.find({});

    response.status(200).json(establishments);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const createEstablishment = async (req, res) => {
  try {
    const {
      name,
      type,
      ownerName,
      contactNumber,
      address
    } = req.body;

    // Validate required fields     
    if (!name || !type || !ownerName || !contactNumber || !address) {
      return res.status(400).json({
        message: "All fields (name, type, ownerName, contactNumber, address) are required"
      });
    }

    // Check if establishment with same name already exists
    const existingEstablishment = await Establishment.findOne({ name });
    if (existingEstablishment) {
      return res.status(409).json({
        message: "Establishment with this name already exists"
      });
    }

    const establishment = await Establishment.create({
      name,
      type,
      ownerName,
      contactNumber,
      address
    });

    return res.status(201).json({
      message: "Establishment created successfully",
      data: establishment
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};


const getEstablishmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid establishment ID"
      });
    }

    const establishment = await Establishment.findById(id);

    if (!establishment) {
      return res.status(404).json({
        message: "Establishment not found"
      });
    }

    return res.status(200).json({
      message: "Establishment retrieved successfully",
      data: establishment
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

const updateEstablishment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      ownerName,
      contactNumber,
      address
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid establishment ID"
      });
    }

    // Check if establishment exists
    const existingEstablishment = await Establishment.findById(id);
    if (!existingEstablishment) {
      return res.status(404).json({
        message: "Establishment not found"
      });
    }

    // Check if name is being changed and if new name already exists
    if (name && name !== existingEstablishment.name) {
      const nameExists = await Establishment.findOne({ 
        name, 
        _id: { $ne: id } 
      });
      if (nameExists) {
        return res.status(409).json({
          message: "Establishment with this name already exists"
        });
      }
    }

    const updatedEstablishment = await Establishment.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(type && { type }),
        ...(ownerName && { ownerName }),
        ...(contactNumber && { contactNumber }),
        ...(address && { address })
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Establishment updated successfully",
      data: updatedEstablishment
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

const deleteEstablishment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid establishment ID"
      });
    }

    const establishment = await Establishment.findByIdAndDelete(id);

    if (!establishment) {
      return res.status(404).json({
        message: "Establishment not found"
      });
    }

    return res.status(200).json({
      message: "Establishment deleted successfully",
      data: establishment
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};


module.exports = { getAllEstablishments, createEstablishment, updateEstablishment, deleteEstablishment, getEstablishmentById }