const Staff = require("../model/Staff");
const Skill = require("../model/Skills");
const Farm = require("../model/Farm");
const { createLog } = require("../utils/logHelper");
const { LOGCONSTANTS } = require("../config/constants");

const getAllStaff = async (request, response) => {
  try {
    // Populate skills to return skill objects instead of ids
    const staff = await Staff.find({}).populate("skills");
    return response.json(staff);
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
};

const postStaff = async (request, response) => {
  try {
    const {
      name,
      age,
      gender,
      email_address,
      position,
      skills,
      contact_number,
      assigned_farm,
      time_in_field,
    } = request.body;

    if (!name || !age || !gender || !time_in_field)
      return response.status(400).json({ message: "name, age, gender and time_in_field are required" });

    // If skills provided as strings (ids), verify they exist
    let skillIds = [];
    if (skills) {
      if (!Array.isArray(skills))
        return response.status(400).json({ message: "skills must be an array of skill IDs" });

      skillIds = skills;

      // Verify all skills exist
      const found = await Skill.find({ _id: { $in: skillIds } }).select("_id");
      if (found.length !== skillIds.length)
        return response.status(400).json({ message: "One or more provided skill IDs do not exist" });
    }

    const staffObj = await Staff.create({
      name,
      age,
      gender,
      email_address,
      position,
      skills: skillIds,
      contact_number,
      assigned_farm,
      time_in_field,
    });

    await createLog({
      action: LOGCONSTANTS.actions.user.CREATE_USER || LOGCONSTANTS.actions.skills.CREATE_SKILL,
      category: LOGCONSTANTS.categories.USER_MANAGEMENT || LOGCONSTANTS.categories.GREEN_PAGE,
      title: "Staff Created",
      description: `Staff "${name}" was created`,
      performedBy: request.userId,
    });

    // return created staff with populated skills
  const populated = await Staff.findById(staffObj._id).populate("skills").populate("assigned_farm");
    return response.status(201).json(populated);
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
};

const updateStaff = async (request, response) => {
  const { id } = request.params;
  if (!id) return response.status(400).json({ message: "ID is required!" });

  try {
    const updatePayload = { ...request.body, updatedAt: new Date() };

  // If skills are provided, verify they exist
    if (updatePayload.skills) {
      if (!Array.isArray(updatePayload.skills))
        return response.status(400).json({ message: "skills must be an array of skill IDs" });

      const found = await Skill.find({ _id: { $in: updatePayload.skills } }).select("_id");
      if (found.length !== updatePayload.skills.length)
        return response.status(400).json({ message: "One or more provided skill IDs do not exist" });
    }

    // If assigned_farm provided, validate farms exist
    if (updatePayload.assigned_farm) {
      if (!Array.isArray(updatePayload.assigned_farm))
        return response.status(400).json({ message: "assigned_farm must be an array of farm IDs" });

      const foundFarms = await Farm.find({ _id: { $in: updatePayload.assigned_farm } }).select("_id");
      if (foundFarms.length !== updatePayload.assigned_farm.length)
        return response.status(400).json({ message: "One or more provided assigned_farm IDs do not exist" });
    }

    const existing = await Staff.findById(id);
    if (!existing) return response.status(404).json({ message: `Staff not found with ID: ${id}` });

  const updated = await Staff.findByIdAndUpdate(id, updatePayload, { new: true }).populate("skills").populate("assigned_farm");

    await createLog({
      action: LOGCONSTANTS.actions.user.UPDATE_USER || LOGCONSTANTS.actions.skills.UPDATE_SKILL,
      category: LOGCONSTANTS.categories.USER_MANAGEMENT || LOGCONSTANTS.categories.GREEN_PAGE,
      title: "Staff Updated",
      description: `Staff "${updated.name}" was updated`,
      performedBy: request.userId,
    });

    return response.json(updated);
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
};

const deleteStaff = async (request, response) => {
  const { id } = request.params;
  if (!id) return response.status(400).json({ message: "ID is required!" });

  try {
    const found = await Staff.findById(id);
    if (!found) return response.status(404).json({ message: `Staff not found with ID: ${id}` });

    await Staff.findByIdAndDelete(id);
    await createLog({
      action: LOGCONSTANTS.actions.user.DELETE_USER || LOGCONSTANTS.actions.skills.DELETE_SKILL,
      category: LOGCONSTANTS.categories.USER_MANAGEMENT || LOGCONSTANTS.categories.GREEN_PAGE,
      title: "Staff Deleted",
      description: `Staff "${found.name}" was deleted`,
      performedBy: request.userId,
    });

    return response.json({ message: "Staff deleted successfully" });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
};

const getStaffByFarm = async (request, response) => {
  try {
    const { farmId } = request.params;
    if (!farmId) return response.status(400).json({ message: "farmId is required" });

    // Find staff where assigned_farm contains the farmId
    const staff = await Staff.find({ assigned_farm: farmId }).populate("skills");
    return response.status(200).json(staff);
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllStaff,
  getStaffByFarm,
  postStaff,
  updateStaff,
  deleteStaff,
};
