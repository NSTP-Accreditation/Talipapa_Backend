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
    if (residentStatus === "resident") {
      filter.isResident = true;
    } else if (residentStatus === "non-resident") {
      filter.isResident = false;
    }

    // Search filter
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { middleName: { $regex: search, $options: "i" } },
      ];
    }

    const records = await Record.find(filter).sort({ createdAt: -1 });

    // Transform records
    const recordsWithStatus = records.map((record) => ({
      ...record.toObject(),
      residentStatus: record.isResident ? "Resident" : "Non-Resident",
    }));

    res.json(recordsWithStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createRecord = async (req, res) => {
  const {
    firstName,
    lastName,
    middleName,
    age,
    gender,
    isResident,
    suffix,
    address,
    contact_number,
  } = req.body;

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
      return res
        .status(400)
        .json({ error: "Record ID and Last Name are required!" });

    // If this is a product redemption (negative points with product_id and quantity)
    if (points < 0 && product_id && quantity) {
      // Verify product exists and has enough stock
      const product = await Product.findById(product_id);

      if (!product) {
        return res.status(404).json({
          error: "Product not found",
          message: "The product you're trying to redeem doesn't exist",
        });
      }

      if (product.stocks < quantity) {
        return res.status(400).json({
          error: "Insufficient stock",
          message: `Only ${product.stocks} unit(s) available. Cannot redeem ${quantity} unit(s).`,
          availableStock: product.stocks,
          requestedQuantity: quantity,
        });
      }

      // Deduct product stock
      await Product.findByIdAndUpdate(product_id, {
        $inc: { stocks: -quantity },
        updatedAt: new Date(),
      });

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
          pointsDeducted: Math.abs(points),
        },
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
    if (contact_number !== undefined)
      updateFields.contact_number = contact_number;
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
          ? product_id
            ? "Product Redeemed"
            : "Points Deducted from Record"
          : "Record Updated",
      description:
        points > 0
          ? `Added ${points} points to ${record_id} with ${materials}`
          : points < 0
          ? product_id
            ? `${record_id} redeemed product (${quantity} unit${
                quantity > 1 ? "s" : ""
              }) for ${Math.abs(points)} points`
            : `Deducted ${Math.abs(points)} points from ${record_id}`
          : `Updated record ${record_id}`,
      performedBy: req.userId,
      targetType: LOGCONSTANTS.targetTypes.RECORD,
      targetId: updatedRecord._id,
      targetName: `${updatedRecord.firstName} ${updatedRecord.lastName}`,
      details: {
        previousPoints:
          typeof points === "number"
            ? updatedRecord.points - points
            : updatedRecord.points,
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
          totalPoints: Math.abs(points),
        };
      }
    }

    await createLog(logPayload);

    const response = {
      message:
        points < 0 && product_id
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
        stockDeducted: true,
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

/**
 * NEW ENDPOINT: Search records by lastName with optional record_id for disambiguation
 * This endpoint allows searching primarily by lastName, with record_id being optional.
 * - If only lastName is provided and one record matches: return that record
 * - If only lastName is provided and multiple records match: return all matches with requiresDisambiguation flag
 * - If both lastName and record_id are provided: return the specific record (existing behavior)
 */
const findRecordByLastName = async (req, res) => {
  const { record_id } = req.params;
  const { lastName } = req.query;

  // lastName is required
  if (!lastName) {
    return res.status(400).json({
      error: "Last Name is required!",
      message: "Please provide a last name to search for records.",
    });
  }

  try {
    // Build the query
    const query = {
      lastName: { $regex: `^${lastName}$`, $options: "i" },
    };

    // If record_id is provided and not empty, add it to the query for exact match
    if (record_id && record_id.trim() !== "") {
      query._id = { $regex: `^${record_id}$`, $options: "i" };
    }

    // Find matching records
    const matchingRecords = await Record.find(query).lean();

    // No records found
    if (matchingRecords.length === 0) {
      return res.status(404).json({
        error: record_id
          ? `Record ${record_id}: ${lastName} Not Found!`
          : `No records found with last name: ${lastName}`,
        message: record_id
          ? "Please verify the Record ID and Last Name are correct."
          : "Please check the spelling of the last name.",
      });
    }

    // Exactly one record found - return it directly
    if (matchingRecords.length === 1) {
      return res.json({
        ...matchingRecords[0],
        requiresDisambiguation: false,
      });
    }

    // Multiple records found - return all with disambiguation flag
    return res.status(409).json({
      error: "Multiple records found with the same last name",
      message: `Found ${matchingRecords.length} records with last name "${lastName}". Please provide a Record ID to select the correct one.`,
      requiresDisambiguation: true,
      matchingRecords: matchingRecords.map((record) => ({
        _id: record._id,
        firstName: record.firstName,
        lastName: record.lastName,
        middleName: record.middleName,
        address: record.address,
        contact_number: record.contact_number,
        points: record.points,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Public version of findRecordByLastName
 * Returns minimal info to avoid leaking sensitive data
 * - Accepts lastName query param (required)
 * - Accepts optional record_id query param (NOT route param)
 * - Returns only _id, firstName, lastName, and points
 */
const findRecordPublicByLastName = async (req, res) => {
  const { lastName, record_id } = req.query;

  if (!lastName) {
    return res.status(400).json({
      error: "Last Name is required!",
      message: "Please provide a last name to search for records.",
    });
  }

  try {
    // Build the query
    const query = {
      lastName: { $regex: `^${lastName}$`, $options: "i" },
    };

    // If record_id is provided in query params, add it to the query
    if (record_id && record_id.trim() !== "") {
      query._id = { $regex: `^${record_id}$`, $options: "i" };
    }

    // Return minimal public fields only
    const matchingRecords = await Record.find(query)
      .select("_id firstName lastName points")
      .lean();

    if (matchingRecords.length === 0) {
      return res.status(404).json({
        error: record_id
          ? `Record ${record_id}: ${lastName} Not Found!`
          : `No records found with last name: ${lastName}`,
        message: record_id
          ? "Please verify the Record ID and Last Name are correct."
          : "Please check the spelling of the last name.",
      });
    }

    if (matchingRecords.length === 1) {
      return res.json({
        ...matchingRecords[0],
        requiresDisambiguation: false,
      });
    }

    // If multiple records, return minimal set and signal disambiguation
    return res.status(409).json({
      error: "Multiple records found with the same last name",
      message: `Found ${matchingRecords.length} records with last name "${lastName}". Please provide a Record ID to select the correct one.`,
      requiresDisambiguation: true,
      matchingRecords: matchingRecords.map((record) => ({
        _id: record._id,
        firstName: record.firstName,
        lastName: record.lastName,
        points: record.points,
      })),
    });
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
      if (residentStatus === "resident") {
        filter.isResident = true;
      } else if (residentStatus === "non-resident") {
        filter.isResident = false;
      } else {
        return res.status(400).json({
          error: "Invalid residentStatus. Use 'resident' or 'non-resident'",
        });
      }
    }

    const searchResults = await Record.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Add residentStatus field to each result
    const resultsWithStatus = searchResults.map((record) => ({
      ...record,
      residentStatus: record.isResident ? "Resident" : "Non-Resident",
    }));

    res.json(resultsWithStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteRecord = async (req, res) => {
  const { record_id } = req.params;

  if (!record_id)
    return res.status(400).json({ message: "Record ID is required!" });
  try {
    const deletedRecord = await Record.findByIdAndDelete(record_id);

    if (!deletedRecord)
      return res
        .status(404)
        .json({ message: "Record not found with ID: " + record_id });

    res.json({ message: `Record ${record_id} deleted successfully!` });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

module.exports = {
  getRecords,
  createRecord,
  updateRecord,
  getSingleRecord,
  findRecordByLastName,
  findRecordPublicByLastName,
  searchRecords,
  deleteRecord,
};
