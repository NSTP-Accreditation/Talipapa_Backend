const FarmInventory = require("../model/FarmInventory");
const { createLog } = require("../utils/logHelper");
const { LOGCONSTANTS } = require("../config/constants");
const { deleteFromS3 } = require("../utils/deleteFromS3");

// Get all farm inventory items
const getAllFarmInventory = async (req, res) => {
  try {
    const inventory = await FarmInventory.find();
    if (!inventory || inventory.length === 0) {
      return res.status(204).json({ message: "No farm inventory items found" });
    }
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single farm inventory item by ID
const getFarmInventoryById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Farm inventory ID is required!" });
  }

  try {
    const item = await FarmInventory.findById(id);

    if (!item) {
      return res.status(404).json({ message: "Farm inventory item not found!" });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new farm inventory item
const createFarmInventory = async (req, res) => {
  const { name, description, mainCategory, subCategory, stocks, unit, farmOrigin } = req.body;

  // Validation
  if (!name || !description || !subCategory || !unit) {
    return res.status(400).json({ 
      error: "Name, description, subcategory, and unit are required!" 
    });
  }

  // Validate subcategory
  const validSubCategories = ["Vegetables", "Herbal Plants", "Fruits", "Seedlings", "Trees"];
  if (!validSubCategories.includes(subCategory)) {
    return res.status(400).json({ 
      error: `Invalid subcategory. Must be one of: ${validSubCategories.join(", ")}` 
    });
  }

  if (isNaN(stocks) || stocks < 0) {
    return res.status(400).json({ 
      error: "Stocks must be a valid non-negative number" 
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Farm inventory item image is required",
    });
  }

  try {
    // Check if item already exists
    const foundItem = await FarmInventory.findOne({ name });
    if (foundItem) {
      return res.status(409).json({ 
        message: `Farm inventory item "${name}" already exists` 
      });
    }

    // Create new farm inventory item
    const newItem = await FarmInventory.create({
      name,
      description,
      mainCategory: "Agricultural",
      subCategory,
      stocks: Number(stocks) || 0,
      unit,
      farmOrigin,
      lastRestocked: new Date(),
      image: {
        url: req.file.location,
        key: req.file.key,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });

    // Log the creation
    await createLog({
      action: LOGCONSTANTS.actions.farmInventory.CREATE_FARM_INVENTORY,
      category: LOGCONSTANTS.categories.INVENTORY,
      title: "New Farm Inventory Item Added",
      description: `Farm item "${name}" (${subCategory}) was added to inventory with ${stocks} ${unit}`,
      performedBy: req.userId,
      targetType: LOGCONSTANTS.targetTypes.FARM_INVENTORY,
      targetId: newItem._id.toString(),
      targetName: name,
      details: { 
        mainCategory: "Agricultural",
        subCategory, 
        stocks, 
        unit, 
        farmOrigin 
      },
    });

    res.status(201).json({ 
      message: `Farm inventory item "${newItem.name}" created successfully!`,
      item: newItem
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update farm inventory item
const updateFarmInventory = async (req, res) => {
  const { id } = req.params;
  const { name, description, mainCategory, subCategory, stocks, unit, farmOrigin } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Farm inventory ID is required!" });
  }

  if (!name || !description || !subCategory || !unit) {
    return res.status(400).json({ 
      error: "Name, description, subcategory, and unit are required!" 
    });
  }

  // Validate subcategory
  const validSubCategories = ["Vegetables", "Herbal Plants", "Fruits", "Seedlings", "Trees"];
  if (!validSubCategories.includes(subCategory)) {
    return res.status(400).json({ 
      error: `Invalid subcategory. Must be one of: ${validSubCategories.join(", ")}` 
    });
  }

  if (isNaN(stocks) || stocks < 0) {
    return res.status(400).json({ 
      error: "Stocks must be a valid non-negative number" 
    });
  }

  try {
    const item = await FarmInventory.findById(id);

    if (!item) {
      return res.status(404).json({ 
        message: `Farm inventory item not found with ID: ${id}` 
      });
    }

    // Update fields
    const updateData = {
      name,
      description,
      mainCategory: "Agricultural",
      subCategory,
      stocks: Number(stocks),
      unit,
      farmOrigin,
      updatedAt: new Date(),
    };

    // If stocks increased, update lastRestocked
    if (Number(stocks) > item.stocks) {
      updateData.lastRestocked = new Date();
    }

    // Handle image update if new image provided
    if (req.file) {
      // Delete old image from S3
      if (item.image && item.image.key) {
        try {
          await deleteFromS3(item.image.key);
        } catch (s3Error) {
          console.error("Failed to delete old image from S3:", s3Error);
        }
      }

      // Add new image
      updateData.image = {
        url: req.file.location,
        key: req.file.key,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      };
    }

    const updatedItem = await FarmInventory.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // Log the update
    await createLog({
      action: LOGCONSTANTS.actions.farmInventory.UPDATE_FARM_INVENTORY,
      category: LOGCONSTANTS.categories.INVENTORY,
      title: "Farm Inventory Item Updated",
      description: `Farm item "${name}" (${subCategory}) was updated`,
      performedBy: req.userId,
      targetType: LOGCONSTANTS.targetTypes.FARM_INVENTORY,
      targetId: updatedItem._id.toString(),
      targetName: name,
      details: { 
        mainCategory: "Agricultural",
        subCategory, 
        stocks, 
        unit, 
        farmOrigin,
        imageUpdated: !!req.file
      },
    });

    res.json({ 
      message: "Farm inventory item updated successfully!",
      item: updatedItem
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update farm inventory stocks only (for quick stock adjustments)
const updateFarmInventoryStocks = async (req, res) => {
  const { id } = req.params;
  const { stocks, operation } = req.body; // operation: "add" or "set"

  if (!id) {
    return res.status(400).json({ message: "Farm inventory ID is required!" });
  }

  if (stocks === undefined || isNaN(stocks) || stocks < 0) {
    return res.status(400).json({ 
      error: "Valid stocks value is required!" 
    });
  }

  try {
    const item = await FarmInventory.findById(id);

    if (!item) {
      return res.status(404).json({ 
        message: `Farm inventory item not found with ID: ${id}` 
      });
    }

    let newStocks;
    if (operation === "add") {
      newStocks = item.stocks + Number(stocks);
    } else {
      newStocks = Number(stocks);
    }

    if (newStocks < 0) {
      return res.status(400).json({ 
        error: "Resulting stocks cannot be negative!" 
      });
    }

    const updateData = {
      stocks: newStocks,
      updatedAt: new Date(),
    };

    // If stocks increased, update lastRestocked
    if (newStocks > item.stocks) {
      updateData.lastRestocked = new Date();
    }

    const updatedItem = await FarmInventory.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // Log the stock update
    await createLog({
      action: LOGCONSTANTS.actions.farmInventory.UPDATE_FARM_INVENTORY,
      category: LOGCONSTANTS.categories.INVENTORY,
      title: "Farm Inventory Stocks Updated",
      description: `Farm item "${item.name}" stocks ${operation === "add" ? "increased" : "updated"} to ${newStocks} ${item.unit}`,
      performedBy: req.userId,
      targetType: LOGCONSTANTS.targetTypes.FARM_INVENTORY,
      targetId: updatedItem._id.toString(),
      targetName: item.name,
      details: { 
        previousStocks: item.stocks,
        newStocks,
        operation,
        changeAmount: stocks
      },
    });

    res.json({ 
      message: "Farm inventory stocks updated successfully!",
      item: updatedItem
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete farm inventory item
const deleteFarmInventory = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Farm inventory ID is required!" });
  }

  try {
    const item = await FarmInventory.findById(id);

    if (!item) {
      return res.status(404).json({ 
        message: `Farm inventory item not found with ID: ${id}` 
      });
    }

    // Delete image from S3
    if (item.image && item.image.key) {
      try {
        await deleteFromS3(item.image.key);
      } catch (s3Error) {
        console.error("Failed to delete image from S3:", s3Error);
      }
    }

    const itemName = item.name;

    // Log the deletion
    await createLog({
      action: LOGCONSTANTS.actions.farmInventory.DELETE_FARM_INVENTORY,
      category: LOGCONSTANTS.categories.INVENTORY,
      title: "Farm Inventory Item Deleted",
      description: `Farm item "${itemName}" (${item.subCategory}) was removed from inventory`,
      performedBy: req.userId,
      targetType: LOGCONSTANTS.targetTypes.FARM_INVENTORY,
      targetId: id,
      targetName: itemName,
    });

    await FarmInventory.deleteOne({ _id: id });

    res.json({ 
      message: `Farm inventory item "${itemName}" deleted successfully!` 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search farm inventory
const searchFarmInventory = async (req, res) => {
  const { query } = req.params;

  if (!query) {
    return res.status(400).json({ error: "Search query is required!" });
  }

  try {
    const items = await FarmInventory.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { subCategory: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ]
    });

    if (!items || items.length === 0) {
      return res.status(404).json({ 
        message: `No farm inventory items found matching "${query}"` 
      });
    }

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get farm inventory by subcategory
const getFarmInventoryBySubCategory = async (req, res) => {
  const { subCategory } = req.params;

  if (!subCategory) {
    return res.status(400).json({ error: "Subcategory is required!" });
  }

  try {
    const items = await FarmInventory.find({ 
      subCategory: { $regex: subCategory, $options: "i" } 
    });

    if (!items || items.length === 0) {
      return res.status(404).json({ 
        message: `No farm inventory items found in subcategory "${subCategory}"` 
      });
    }

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get low stock farm inventory items (less than threshold)
const getLowStockFarmInventory = async (req, res) => {
  const threshold = req.query.threshold || 10; // Default threshold is 10

  try {
    const items = await FarmInventory.find({ 
      stocks: { $lt: Number(threshold) } 
    }).sort({ stocks: 1 }); // Sort by lowest stock first

    res.json({
      threshold: Number(threshold),
      count: items.length,
      items
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllFarmInventory,
  getFarmInventoryById,
  createFarmInventory,
  updateFarmInventory,
  updateFarmInventoryStocks,
  deleteFarmInventory,
  searchFarmInventory,
  getFarmInventoryBySubCategory,
  getLowStockFarmInventory,
};
