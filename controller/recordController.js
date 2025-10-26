const Record = require("../model/Record");
const { createLog } = require("../utils/logHelper");
const { LOGCONSTANTS } = require("../config/constants");

const getRecords = async (req, res) => {
  try {
    const records = await Record.find().sort({ createdAt: -1 });
    if (!records) return res.status(200).json({ message: "No Records Found." });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createRecord = async (req, res) => {
  const { firstName, lastName, middleName, age, address, contact_number } =
    req.body;

  if (!firstName || !lastName || !middleName)
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
      age,
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
    contact_number,
    address,
    points,
    materials,
  } = req.body;

  try {
    if (!record_id || !lastName)
      return res.status(400).json({ error: "Record ID and Last Name are required!" });

    // Build dynamic update object
    const updateFields = {
      updatedAt: new Date(),
    };

    if (firstName !== undefined) updateFields.firstName = firstName;
    if (middleName !== undefined) updateFields.middleName = middleName;
    if (age !== undefined) updateFields.age = age;
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
        points > 0 ? "Points Added to Record" : points < 0 ? "Points Deducted from Record" : "Record Updated",
      description:
        points > 0
          ? `Added ${points} points to ${record_id} with ${materials}`
          : points < 0
          ? `Deducted ${Math.abs(points)} points from ${record_id}`
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
    }

    await createLog(logPayload);

    res.json({
      record_id: updatedRecord._id,
      lastName: updatedRecord.lastName,
      updatedFields: updateFields,
      earnedPoints: points || 0,
      currentPoints: updatedRecord.points,
    });
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
  const { query } = req.query;

  if (!query)
    return res.status(400).json({ error: "Search query is required!" });

  try {
    const searchResults = await Record.find({
      $or: [
        { _id: { $regex: query, $options: "i" } },
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { middleName: { $regex: query, $options: "i" } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({
      message: "Records found",
      count: searchResults.length,
      results: searchResults,
    });
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
