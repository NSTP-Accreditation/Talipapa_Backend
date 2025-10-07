const Record = require("../model/Record");

const getRecords = async (req, res) => {
  try {
    const records = await Record.find().sort({ created_at: -1 });
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
    return res
      .status(409)
      .json({
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

    res.status(201).json({
      message: `${newRecord._id}: ${newRecord.lastName} New Record Created!`,
      record_id: newRecord._id,
      lastName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateRecord = async (req, res) => {
  const { record_id } = req.params;
  const { lastName, points, materials } = req.body;

  try {
    if (!record_id || !lastName || !points /* TODO: || !materials*/)
      return res.status(400).json({ error: "All Fields are required!" });

    // TODO: Ensure that the points is valid

    const updatedRecord = await Record.findOneAndUpdate(
      {
        _id: { $regex: `^${record_id}$`, $options: "i" },
        lastName: { $regex: `^${lastName}$`, $options: "i" },
      },
      { 
        updatedAt: new Date(),
        $inc: { points } 
      },
      { new: true }
    ).lean();

    if (!updatedRecord)
      return res
        .status(404)
        .json({ error: `Record ${record_id}: ${lastName} Not Found!` });

    // TODO: RECORD LOG
    // const newRecordLog = await RecordLog.create({
    //   submitted_by: updatedRecord._id,
    //   materials,
    //   points_earned: points,
    // });

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

module.exports = { getRecords, createRecord, updateRecord, getSingleRecord };
