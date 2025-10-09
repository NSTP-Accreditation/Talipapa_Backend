const PageContent = require("../model/PageContent");
const { createLog } = require("../utils/logHelper");

const getAllPageContents = async (request, response) => {
  try {
    const allContent = await PageContent.find({});

    response.json(allContent);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const postPageContents = async (request, response) => {
  const { mission, vision, barangayName, barangayDescription } =
    request.body;

  try {
    const allContent = await PageContent.find({});
    if (allContent.length > 0) {
      if (mission || vision || barangayName || barangayDescription) {
        return response
          .status(400)
          .json({
            message:
              "Mission, Vision, Barangay Name and Barangay Description content is already defined!",
          });
      }
    }

    if (!mission || !vision || !barangayName || !barangayDescription)
      return response
        .status(400)
        .json({
          message:
            "Mission Vision, brgy name and description content are required!",
        });

    const pageContent = await PageContent.create({
      mission,
      vision,
      barangayName,
      barangayDescription,
    });

    // Log page content creation
    await createLog({
      action: 'PAGE_CONTENT_CREATE',
      category: 'CONTENT_MANAGEMENT',
      title: 'Page Content Created',
      description: `Page content for barangay "${barangayName}" was created`,
      performedBy: request.user,
      targetType: 'PAGE_CONTENT',
      targetId: pageContent._id.toString(),
      targetName: barangayName,
      details: { mission, vision, barangayDescription },
      ipAddress: request.ip,
      status: 'SUCCESS'
    });

    response.status(201).json(pageContent);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const updatePageContents = async (request, response) => {
  const { id } = request.params;
  const { mission, vision, barangayName, barangayDescription } =
    request.body;

  if (!id) return response.status(400).json({ message: "The ID is required!" });

  try {
    if (!mission || !vision || !barangayName || !barangayDescription)
      return response
        .status(400)
        .json({ message: "Mission, Vision, Barangay Name, Barangay Description are required!" });

    const oldContent = await PageContent.findById({ _id: id });
    if (!oldContent) return response.status(404).json({ message: `Page content not found with ID: ${id}` });

    const updatedContent = await PageContent.findByIdAndUpdate(
      { _id: id },
      {
        mission,
        vision,
        barangayName,
        barangayDescription,
        updatedAt: new Date(),
      },
      { new: true }
    );

    // Log page content update
    await createLog({
      action: 'PAGE_CONTENT_UPDATE',
      category: 'CONTENT_MANAGEMENT',
      title: 'Page Content Updated',
      description: `Page content for barangay "${barangayName}" was updated`,
      performedBy: request.user,
      targetType: 'PAGE_CONTENT',
      targetId: id,
      targetName: barangayName,
      details: {
        before: {
          mission: oldContent.mission,
          vision: oldContent.vision,
          barangayName: oldContent.barangayName,
          barangayDescription: oldContent.barangayDescription
        },
        after: { mission, vision, barangayName, barangayDescription }
      },
      ipAddress: request.ip,
      status: 'SUCCESS'
    });

    response.json(updatedContent);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

module.exports = { getAllPageContents, postPageContents, updatePageContents };
