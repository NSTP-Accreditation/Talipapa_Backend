const PageContent = require("../model/PageContent");
const { createLog } = require("../utils/logHelper");
const { LOGCONSTANTS } = require("../config/constants");

const getPageContent = async (request, response) => {
  const { id } = request.params;

  if (!id) return response.status(400).json({ message: "The ID is required!" });

  try {
    const content = await PageContent.findById(id);
    if (!content)
      return response
        .status(404)
        .json({ message: `Page content not found with ID: ${id}` });

    response.json(content);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const postPageContents = async (request, response) => {
  const { mission, vision, barangayName, barangayHistory, barangayDescription } = request.body;

  try {
    const allContent = await PageContent.find({});
    if (allContent.length > 0) {
      if (
        mission ||
        vision ||
        barangayName ||
        barangayHistory ||
        barangayDescription
      ) {
        return response.status(400).json({
          message:
            "Mission, Vision, Barangay Name, Barangay History and Barangay Description content is already defined!",
        });
      }
    }

    if (
      !mission ||
      !vision ||
      !barangayName ||
      !barangayHistory ||
      !barangayDescription
    )
      return response.status(400).json({
        message:
          "Mission, Vision, Barangay Name, Barangay History and Barangay Description are required!",
      });

    const pageContent = await PageContent.create({
      mission,
      vision,
      barangayName,
      barangayHistory,
      barangayDescription,
    });

    await createLog({
      action: LOGCONSTANTS.actions.pageContents.CREATE_PAGE_CONTENTS,
      category: LOGCONSTANTS.categories.CONTENT_MANAGEMENT,
      title: "New Page Content Created",
      description: `Page content for barangay "${barangayName}" was created`,
      performedBy: request.userId,
    });

    response.status(201).json(pageContent);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const updatePageContents = async (request, response) => {
  const { id } = request.params;
  if (!id) return response.status(400).json({ message: "The ID is required!" });

  try {
    const {
      mission,
      vision,
      barangayName,
      barangayHistory,
      barangayDescription,
    } = request.body;
    if (!mission || !vision || !barangayName || !barangayHistory || !barangayDescription)
      return response
        .status(400)
        .json({
          message:
            "Mission, Vision, Barangay Name, Barangay History, Barangay Description are required!",
        });

    const oldContent = await PageContent.findById({ _id: id });
    if (!oldContent)
      return response
        .status(404)
        .json({ message: `Page content not found with ID: ${id}` });

    // Create update object with only the fields that are provided
    const updateFields = {
      updatedAt: new Date(),
    };

    // Only add fields to update if they are provided in the request
    if (mission !== undefined) updateFields.mission = mission;
    if (vision !== undefined) updateFields.vision = vision;
    if (barangayName !== undefined) updateFields.barangayName = barangayName;
    if (barangayHistory !== undefined)
      updateFields.barangayHistory = barangayHistory;
    if (barangayDescription !== undefined)
      updateFields.barangayDescription = barangayDescription;

    // Check if at least one field is being updated (besides updatedAt)
    const fieldsToUpdate = Object.keys(updateFields).filter(
      (key) => key !== "updatedAt"
    );
    if (fieldsToUpdate.length === 0) {
      return response
        .status(400)
        .json({ message: "No valid fields to update" });
    }

    const updatedContent = await PageContent.findByIdAndUpdate(
      { _id: id },
      updateFields,
      { new: true, runValidators: true }
    );

    await createLog({
      action: LOGCONSTANTS.actions.pageContents.UPDATE_PAGE_CONTENTS,
      category: LOGCONSTANTS.categories.CONTENT_MANAGEMENT,
      title: "Page Content Updated",
      description: `Page content for barangay "${updatedContent.barangayName}" was updated (text only)`,
      performedBy: request.userId,
      targetType: LOGCONSTANTS.targetTypes.PAGE_CONTENT,
      targetId: updatedContent._id,
      targetName: updatedContent.barangayName,
      details: {
        updatedFields: fieldsToUpdate,
      },
    });

    response.json({
      message: "Page content updated successfully",
      updatedFields: fieldsToUpdate,
      data: updatedContent,
    });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const updatePageContentsWithImage = async (request, response) => {
  const { id } = request.params;

  if (!id) return response.status(400).json({ message: "The ID is required!" });

  try {
    const {
      mission,
      vision,
      barangayName,
      barangayHistory,
      barangayDescription,
    } = request.body;
    const imageFile = request.file;

    const oldContent = await PageContent.findById({ _id: id });
    if (!oldContent)
      return response
        .status(404)
        .json({ message: `Page content not found with ID: ${id}` });

    // Create update object with only the fields that are provided
    const updateFields = {};

    // Only add fields to update if they are provided in the request
    if (mission !== undefined) updateFields.mission = mission;
    if (vision !== undefined) updateFields.vision = vision;
    if (barangayName !== undefined) updateFields.barangayName = barangayName;
    if (barangayHistory !== undefined)
      updateFields.barangayHistory = barangayHistory;
    if (barangayDescription !== undefined)
      updateFields.barangayDescription = barangayDescription;

    if (imageFile) {
      updateFields.image = {
        url: imageFile.location,
        key: imageFile.key,
        originalName: imageFile.originalname,
        size: imageFile.size,
        mimetype: imageFile.mimetype,
      };
    }

    // Check if at least one field is being updated (besides updatedAt)
    const fieldsToUpdate = Object.keys(updateFields).filter(
      (key) => key !== "updatedAt"
    );
    if (fieldsToUpdate.length === 0) {
      return response
        .status(400)
        .json({ message: "No valid fields to update" });
    }

    const updatedContent = await PageContent.findByIdAndUpdate(
      { _id: id },
      updateFields,
      { new: true, runValidators: true }
    );

    await createLog({
      action: LOGCONSTANTS.actions.pageContents.UPDATE_PAGE_CONTENTS,
      category: LOGCONSTANTS.categories.CONTENT_MANAGEMENT,
      title: "Page Content Updated",
      description: `Page content for barangay "${updatedContent.barangayName}" was updated (text only)`,
      performedBy: request.userId,
      targetType: LOGCONSTANTS.targetTypes.PAGE_CONTENT,
      targetId: updatedContent._id,
      targetName: updatedContent.barangayName,
      details: {
        updatedFields: fieldsToUpdate,
      },
    });

    response.json({
      message: "Page content updated successfully",
      // updatedFields: fieldsToUpdate,
      // data: updatedContent
    });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

module.exports = {
  getPageContent,
  postPageContents,
  updatePageContents,
  updatePageContentsWithImage,
};
