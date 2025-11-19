const Record = require("../model/Record");
const Product = require("../model/Products");
const { createLog } = require("../utils/logHelper");
const { LOGCONSTANTS } = require("../config/constants");

const getRecords = async (req, res) => {
  try {
    const { residentStatus, search } = req.query;
    
    // Build filter object
    const filter = {};
    
    // Filter by resident status
    if (residentStatus === 'resident') {
      filter.isResident = true;
    } else if (residentStatus === 'non-resident') {
      filter.isResident = false;
    }
    
    // Search filter
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { middleName: { $regex: search, $options: 'i' } }
      ];
    }

    const records = await Record.find(filter).sort({ createdAt: -1 });
    
      // Transform records
    const recordsWithStatus = records.map(record => ({
      ...record.toObject(),
      residentStatus: record.isResident ? 'Resident' : 'Non-Resident'
    }));

    res.json(recordsWithStatus  );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createRecord = async (req, res) => {
  const { firstName, lastName, middleName, age, gender, isResident, suffix, address, contact_number } =
    req.body;

  if (!firstName || !lastName || !middleName || !gender)
    return res.status(400).json({ error: "All Fields are Required" });

  const duplicateRecord = await Record.findOne({
    firstName: { $regex: `^${firstName}$`, $options: "i" },
    lastName: { $regex: `^${lastName}$`, $options: "i" },
  });

  if (duplicateRecord)
    return res.status(409).json({
      error: `Record ${firstName} ${middleName} ${lastName} Already Exists`,
    });

  try {
    const newRecord = await Record.create({
      firstName,
      lastName,
      middleName,
      suffix,
      age,
      gender,
      isResident,
      address,
      contact_number,
    });

    await createLog({
      action: LOGCONSTANTS.actions.records.CREATE_RECORD,
      category: LOGCONSTANTS.categories.RECORD_MANAGEMENT,
      title: "New Record Created",
      description: `Created record for ${firstName} ${middleName} ${lastName} (${newRecord._id})`,
      performedBy: req.userId,
      targetType: LOGCONSTANTS.targetTypes.RECORD,
      targetId: newRecord._id,
      targetName: `${firstName} ${lastName}`,
      details: { age, address, contact_number },
    });

    res.status(201).json({
      message: `${newRecord._id}: ${newRecord.lastName} New Record Created!`,
      record_id: newRecord._id,
      lastName,
      createdAt: newRecord.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateRecord = async (req, res) => {
  const { record_id } = req.params;
  const {
    firstName,
    lastName,
    middleName,
    age,
    isResident,
    contact_number,
    address,
    gender,
    points,
    materials,
    product_id,
    quantity,
  } = req.body;

  try {
    if (!record_id || !lastName)
      return res.status(400).json({ error: "Record ID and Last Name are required!" });

    // If this is a product redemption (negative points with product_id and quantity)
    if (points < 0 && product_id && quantity) {
      // Verify product exists and has enough stock
      const product = await Product.findById(product_id);
      
      if (!product) {
        return res.status(404).json({ 
          error: "Product not found",
          message: "The product you're trying to redeem doesn't exist" 
        });
      }

      if (product.stocks < quantity) {
        return res.status(400).json({ 
          error: "Insufficient stock",
          message: `Only ${product.stocks} unit(s) available. Cannot redeem ${quantity} unit(s).`,
          availableStock: product.stocks,
          requestedQuantity: quantity
        });
      }

      // Deduct product stock
      await Product.findByIdAndUpdate(
        product_id,
        { 
          $inc: { stocks: -quantity },
          updatedAt: new Date()
        }
      );

      // Log product stock deduction
      await createLog({
        action: LOGCONSTANTS.actions.products.UPDATE_PRODUCT,
        category: LOGCONSTANTS.categories.INVENTORY,
        title: "Product Redeemed - Stock Deducted",
        description: `${quantity} unit(s) of "${product.name}" redeemed by ${record_id}`,
        performedBy: req.userId,
        targetType: LOGCONSTANTS.targetTypes.PRODUCT,
        targetId: product._id.toString(),
        targetName: product.name,
        details: {
          previousStocks: product.stocks,
          newStocks: product.stocks - quantity,
          quantityRedeemed: quantity,
          redeemedBy: record_id,
          pointsDeducted: Math.abs(points)
        }
      });
    }

    // Build dynamic update object
    const updateFields = {
      updatedAt: new Date(),
    };

    if (firstName !== undefined) updateFields.firstName = firstName;
    if (middleName !== undefined) updateFields.middleName = middleName;
    if (age !== undefined) updateFields.age = age;
    if (gender !== undefined) updateFields.gender = gender;
    if (isResident !== undefined) updateFields.isResident = isResident;
    if (contact_number !== undefined) updateFields.contact_number = contact_number;
    if (address !== undefined) updateFields.address = address;
    if (materials !== undefined) updateFields.materials = materials;

    // Handle points increment/decrement safely
    const updateQuery = { $set: updateFields };
    if (typeof points === "number" && points !== 0) {
      updateQuery.$inc = { points };
    }

    // Find and update record
    const updatedRecord = await Record.findOneAndUpdate(
      {
        _id: { $regex: `^${record_id}$`, $options: "i" },
      },
      updateQuery,
      { new: true }
    ).lean();

    if (!updatedRecord)
      return res
        .status(404)
        .json({ error: `Record ${record_id}: ${lastName} Not Found!` });

    // Logging
    const logPayload = {
      action: LOGCONSTANTS.actions.records.UPDATE_RECORD,
      category: LOGCONSTANTS.categories.RECORD_MANAGEMENT,
      title:
        points > 0 
          ? "Points Added to Record" 
          : points < 0 
            ? (product_id ? "Product Redeemed" : "Points Deducted from Record")
            : "Record Updated",
      description:
        points > 0
          ? `Added ${points} points to ${record_id} with ${materials}`
          : points < 0
          ? (product_id 
              ? `${record_id} redeemed product (${quantity} unit${quantity > 1 ? 's' : ''}) for ${Math.abs(points)} points`
              : `Deducted ${Math.abs(points)} points from ${record_id}`)
          : `Updated record ${record_id}`,
      performedBy: req.userId,
      targetType: LOGCONSTANTS.targetTypes.RECORD,
      targetId: updatedRecord._id,
      targetName: `${updatedRecord.firstName} ${updatedRecord.lastName}`,
      details: {
        previousPoints: typeof points === "number" ? updatedRecord.points - points : updatedRecord.points,
        newPoints: updatedRecord.points,
        materials,
        updatedFields: Object.keys(updateFields),
      },
    };

    if (points > 0) {
      logPayload.details.pointsAdded = points;
    } else if (points < 0) {
      logPayload.details.pointsDeducted = points;
      if (product_id && quantity) {
        logPayload.details.productRedemption = {
          product_id,
          quantity,
          totalPoints: Math.abs(points)
        };
      }
    }

    await createLog(logPayload);

    const response = {
      message: points < 0 && product_id 
        ? `Product redeemed successfully! ${quantity} unit(s) deducted from inventory.`
        : points > 0
          ? "Points added successfully!"
          : "Record updated successfully!",
      record_id: updatedRecord._id,
      lastName: updatedRecord.lastName,
      updatedFields: updateFields,
      earnedPoints: points || 0,
      currentPoints: updatedRecord.points,
    };

    // Add product redemption info to response
    if (points < 0 && product_id && quantity) {
      response.productRedemption = {
        product_id,
        quantity,
        stockDeducted: true
      };
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getSingleRecord = async (req, res) => {
  const { record_id } = req.params;
  const { lastName } = req.query;

  if (!record_id || !lastName)
    return res
      .status(400)
      .json({ error: "Record Id and Last Name are required!" });

  try {
    const foundRecord = await Record.findOne({
      _id: { $regex: `^${record_id}$`, $options: "i" },
      lastName: { $regex: `^${lastName}$`, $options: "i" },
    }).exec();
    if (!foundRecord)
      return res
        .status(404)
        .json({ error: `Record ${record_id}: ${lastName} Not Found!` });

    res.json(foundRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const searchRecords = async (req, res) => {
  const { residentStatus, query } = req.query;

  if (!query)
    return res.status(400).json({ error: "Search query is required!" });

  try {
    // Build filter object
    const filter = {
      $or: [
        { _id: { $regex: query, $options: "i" } },
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { middleName: { $regex: query, $options: "i" } },
      ],
    };

    // Add resident status filter if provided
    if (residentStatus) {
      if (residentStatus === 'resident') {
        filter.isResident = true;
      } else if (residentStatus === 'non-resident') {
        filter.isResident = false;
      } else {
        return res.status(400).json({ 
          error: "Invalid residentStatus. Use 'resident' or 'non-resident'" 
        });
      }
    }

    const searchResults = await Record.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Add residentStatus field to each result
    const resultsWithStatus = searchResults.map(record => ({
      ...record,
      residentStatus: record.isResident ? 'Resident' : 'Non-Resident'
    }));

    res.json(resultsWithStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteRecord = async (req, res) => {
  const { record_id } = req.params;

  if(!record_id) return res.status(400).json({ message: "Record ID is required!"});
  try {
    const deletedRecord = await Record.findByIdAndDelete(record_id);
    
    if(!deletedRecord) return res.status(404).json({ message: "Record not found with ID: " + record_id});
    
    res.json({ message: `Record ${record_id} deleted successfully!`});
  } catch (error) {
    res.status(500).json({ message: error });
  }
}

module.exports = {
  getRecords,
  createRecord,
  updateRecord,
  getSingleRecord,
  searchRecords,
  deleteRecord
};
