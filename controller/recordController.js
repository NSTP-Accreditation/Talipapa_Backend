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
  const { firstName, lastName, middleName, age, address, contactNumber } =
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
      contactNumber,
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
      details: { age, address, contactNumber },
    });

    res.status(201).json({
      message: `${newRecord._id}: ${newRecord.lastName} New Record Created!`,
      record_id: newRecord._id,
      lastName,
      createdAt: newRecord.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateRecord = async (req, res) => {
  const { record_id } = req.params;
  const { lastName, points, materials } = req.body;

  try {
    if (!record_id || !lastName)
      return res.status(400).json({ error: "All Fields are required!" });

    const updatedRecord = await Record.findOneAndUpdate(
      {
        _id: { $regex: `^${record_id}$`, $options: "i" },
        lastName: { $regex: `^${lastName}$`, $options: "i" },
      },
      {
        updatedAt: new Date(),
        $inc: { points },
      },
      { new: true }
    ).lean();

    if (!updatedRecord)
      return res
        .status(404)
        .json({ error: `Record ${record_id}: ${lastName} Not Found!` });

    const logPayload = {
      action: LOGCONSTANTS.actions.records.UPDATE_RECORD,
      category: LOGCONSTANTS.categories.RECORD_MANAGEMENT,
      title:
        points > 0 ? "Points Added to Record" : "Points Deducted from Record",
      description:
        points > 0
          ? `Added ${points} points to ${record_id} with ${materials}`
          : `Deducted ${points} points from ${record_id})`,
      performedBy: req.userId,
      targetType: LOGCONSTANTS.targetTypes.RECORD,
      targetId: updatedRecord._id,
      targetName: `${updatedRecord.firstName} ${updatedRecord.lastName}`,
      details: {
        // pointsAdded: points,
        previousPoints: updatedRecord.points - points,
        newPoints: updatedRecord.points,
        materials: materials,
      },
    };

    if (points > 0) {
      logPayload.details.pointsAdded = points;
    } else {
      logPayload.details.pointsDeducted = points;
    }
    await createLog(logPayload);

    res.json({
      record_id: updatedRecord._id,
      lastName: updatedRecord.lastName,
      earnedPoints: points,
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

    // if (!searchResults || searchResults.length === 0)
    //   return res
    //     .status(404)
    //     .json({
    //       message: "No records found matching your search.",
    //       count: 0,
    //       results: []
    //     });

    res.json({
      message: "Records found",
      count: searchResults.length,
      results: searchResults,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getRecords,
  createRecord,
  updateRecord,
  getSingleRecord,
  searchRecords,
};
