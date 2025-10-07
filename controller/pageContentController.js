const PageContent = require("../model/PageContent");

//const { getAllPageContents, postPageContents, updatePageContents } = require("../../controller/newsController");

const getAllPageContents = async (request, response) => {
  try {
    const allContent = await PageContent.find({});

    response.json(allContent);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const postPageContents = async (request, response) => {
  const { mission, vision, baranggay_name, baranggay_description } =
    request.body;

  try {
    const allContent = await PageContent.find({});
    if (allContent.length > 0) {
      if (mission || vision || baranggay_name || baranggay_description) {
        return response
          .status(400)
          .json({
            message:
              "Mission, Vision, brgy name and description content is already defined!",
          });
      }
    }

    if (!mission || !vision || !baranggay_name || !baranggay_description)
      return response
        .status(400)
        .json({
          message:
            "Mission Vision, brgy name and description content are required!",
        });

    const pageContent = await PageContent.create({
      mission,
      vision,
      baranggay_name,
      baranggay_description,
    });

    response.status(201).json(pageContent);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const updatePageContents = async (request, response) => {
  const { id } = request.params;
  const { mission, vision, baranggay_name, baranggay_description } =
    request.body;

  if (!id) return response.status(400).json({ message: "The ID is required!" });

  try {
    if (!mission || !vision || !baranggay_name || !baranggay_description)
      return response
        .status(400)
        .json({ message: "Mission and Vision are required!" });

    const updatedContent = await PageContent.findByIdAndUpdate(
      { _id: id },
      {
        mission,
        vision,
        baranggay_name,
        baranggay_description,
        updated_at: new Date(),
      },
      { new: true }
    );

    response.json(updatedContent);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

module.exports = { getAllPageContents, postPageContents, updatePageContents };
