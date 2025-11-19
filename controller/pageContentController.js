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
  const {
    mission,
    vision,
    barangayName,
    barangayHistory,
    barangayDescription,
  } = request.body;

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
      youtubeUrl,
    } = request.body;

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
    if (youtubeUrl !== undefined) updateFields.youtubeUrl = youtubeUrl;

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
      youtubeUrl,
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
    if (youtubeUrl !== undefined) updateFields.youtubeUrl = youtubeUrl;

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

const addCarouselItem = async (request, response) => {
  const { id } = request.params; // pageContent ID
  const { title, subTitle, link, order } = request.body;
  const imageFile = request.file;

  if (!id)
    return response
      .status(400)
      .json({ message: "Page content ID is required!" });

  try {
    if (!title || !order || !imageFile) {
      return response.status(400).json({
        message: "Title, Image and order are required for carousel item",
      });
    }

    const pageContent = await PageContent.findById(id);
    if (!pageContent) {
      return response.status(404).json({
        message: `Page content not found with ID: ${id}`,
      });
    }

    // Check if order already exists
    const existingOrder = pageContent.carousel.find(
      (item) => item.order === parseInt(order)
    );
    if (existingOrder) {
      return response.status(400).json({
        message: `Carousel item with order ${order} already exists`,
      });
    }

    const carouselItem = {
      title,
      subTitle: subTitle || "",
      link: link || "",
      order: parseInt(order),
    };

    if (imageFile) {
      carouselItem.image = {
        url: imageFile.location,
        key: imageFile.key,
        originalName: imageFile.originalname,
        size: imageFile.size,
        mimetype: imageFile.mimetype,
      };
    }

    pageContent.carousel.push(carouselItem);
    await pageContent.save();

    await createLog({
      action: LOGCONSTANTS.actions.pageContents.ADD_CAROUSEL_ITEM,
      category: LOGCONSTANTS.categories.CONTENT_MANAGEMENT,
      title: "Carousel Item Added",
      description: `Carousel item "${title}" was added to page content`,
      performedBy: request.userId,
      targetType: LOGCONSTANTS.targetTypes.PAGE_CONTENT,
      targetId: pageContent._id,
      targetName: pageContent.barangayName,
    });

    response.status(201).json({
      message: "Carousel item added successfully",
      data: pageContent.carousel[pageContent.carousel.length - 1],
    });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

// Update carousel item
const updateCarouselItem = async (request, response) => {
  const { id, carouselItemId } = request.params;
  const { title, subTitle, link, order } = request.body;
  const imageFile = request.file;

  if (!id || !carouselItemId) {
    return response.status(400).json({
      message: "Page content ID and carousel item ID are required!",
    });
  }

  try {
    const pageContent = await PageContent.findById(id);
    if (!pageContent) {
      return response.status(404).json({
        message: `Page content not found with ID: ${id}`,
      });
    }

    const carouselItem = pageContent.carousel.id(carouselItemId);
    if (!carouselItem) {
      return response.status(404).json({
        message: `Carousel item not found with ID: ${carouselItemId}`,
      });
    }

    // Check if order is being changed and if it conflicts with existing order
    if (order && order !== carouselItem.order) {
      const existingOrder = pageContent.carousel.find(
        (item) =>
          item.order === parseInt(order) &&
          item._id.toString() !== carouselItemId
      );
      if (existingOrder) {
        return response.status(400).json({
          message: `Carousel item with order ${order} already exists`,
        });
      }
      carouselItem.order = parseInt(order);
    }

    if (title !== undefined) carouselItem.title = title;
    if (subTitle !== undefined) carouselItem.subTitle = subTitle;
    if (link !== undefined) carouselItem.link = link;

    if (imageFile) {
      carouselItem.image = {
        url: imageFile.location,
        key: imageFile.key,
        originalName: imageFile.originalname,
        size: imageFile.size,
        mimetype: imageFile.mimetype,
      };
    }

    await pageContent.save();

    await createLog({
      action: LOGCONSTANTS.actions.pageContents.UPDATE_CAROUSEL_ITEM,
      category: LOGCONSTANTS.categories.CONTENT_MANAGEMENT,
      title: "Carousel Item Updated",
      description: `Carousel item "${carouselItem.title}" was updated`,
      performedBy: request.userId,
      targetType: LOGCONSTANTS.targetTypes.PAGE_CONTENT,
      targetId: pageContent._id,
      targetName: pageContent.barangayName,
    });

    response.json({
      message: "Carousel item updated successfully",
      data: carouselItem,
    });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

// Delete carousel item
const deleteCarouselItem = async (request, response) => {
  const { id, carouselItemId } = request.params;

  if (!id || !carouselItemId) {
    return response.status(400).json({
      message: "Page content ID and carousel item ID are required!",
    });
  }

  try {
    const pageContent = await PageContent.findById(id);
    if (!pageContent) {
      return response.status(404).json({
        message: `Page content not found with ID: ${id}`,
      });
    }

    const carouselItem = pageContent.carousel.id(carouselItemId);
    if (!carouselItem) {
      return response.status(404).json({
        message: `Carousel item not found with ID: ${carouselItemId}`,
      });
    }

    pageContent.carousel.pull(carouselItemId);
    await pageContent.save();

    await createLog({
      action: LOGCONSTANTS.actions.pageContents.DELETE_CAROUSEL_ITEM,
      category: LOGCONSTANTS.categories.CONTENT_MANAGEMENT,
      title: "Carousel Item Deleted",
      description: `Carousel item "${carouselItem.title}" was deleted`,
      performedBy: request.userId,
      targetType: LOGCONSTANTS.targetTypes.PAGE_CONTENT,
      targetId: pageContent._id,
      targetName: pageContent.barangayName,
    });

    response.json({
      message: "Carousel item deleted successfully",
      data: { deletedItem: carouselItem },
    });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

// Get all carousel items (sorted by order)
const getCarouselItems = async (request, response) => {
  const { id } = request.params;

  if (!id)
    return response
      .status(400)
      .json({ message: "Page content ID is required!" });

  try {
    const pageContent = await PageContent.findById(id);
    if (!pageContent) {
      return response.status(404).json({
        message: `Page content not found with ID: ${id}`,
      });
    }

    // Sort carousel items by order
    const sortedCarousel = pageContent.carousel.sort(
      (a, b) => a.order - b.order
    );

    response.json({
      message: "Carousel items retrieved successfully",
      data: sortedCarousel,
      count: sortedCarousel.length,
    });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

/**
 * Batch reorder carousel slides
 * @route PATCH /pagecontent/:id/carousel/reorder
 * @body { slideOrders: [{ slideId: string, order: number }, ...] }
 */
const reorderCarouselSlides = async (request, response) => {
  const { id } = request.params; // pageContent ID
  const { slideOrders } = request.body;

  try {
    // Validate input
    if (!Array.isArray(slideOrders) || slideOrders.length === 0) {
      return response.status(400).json({
        message: "slideOrders must be a non-empty array",
      });
    }

    // Validate each item has slideId and order
    const isValid = slideOrders.every(
      (item) => item.slideId && typeof item.order === "number"
    );

    if (!isValid) {
      return response.status(400).json({
        message: "Each item must have slideId (string) and order (number)",
      });
    }

    // Find the page content
    const pageContent = await PageContent.findById(id);

    if (!pageContent) {
      return response.status(404).json({
        message: `Page content not found with ID: ${id}`,
      });
    }

    // Validate all slideIds exist in the carousel
    const existingSlideIds = pageContent.carousel.map((slide) =>
      slide._id.toString()
    );
    const requestedSlideIds = slideOrders.map((item) => item.slideId);

    const allIdsExist = requestedSlideIds.every((id) =>
      existingSlideIds.includes(id)
    );

    if (!allIdsExist) {
      return response.status(400).json({
        message: "One or more slide IDs do not exist",
      });
    }

    // Update each slide's order
    slideOrders.forEach(({ slideId, order }) => {
      const slide = pageContent.carousel.find(
        (s) => s._id.toString() === slideId
      );
      if (slide) {
        slide.order = order;
      }
    });

    // Sort carousel array by order (for consistency)
    pageContent.carousel.sort((a, b) => (a.order || 0) - (b.order || 0));

    // Save to database
    await pageContent.save();

    // Create audit log
    await createLog({
      action: LOGCONSTANTS.actions.pageContents.UPDATE_CAROUSEL_ITEM,
      category: LOGCONSTANTS.categories.CONTENT_MANAGEMENT,
      title: "Carousel Items Reordered",
      description: `${slideOrders.length} carousel items were reordered`,
      performedBy: request.userId,
      targetType: LOGCONSTANTS.targetTypes.PAGE_CONTENT,
      targetId: pageContent._id,
      targetName: pageContent.barangayName,
      details: {
        reorderedCount: slideOrders.length,
      },
    });

    // Return success response
    response.json({
      success: true,
      message: "Slide order updated successfully",
      carousel: pageContent.carousel,
    });
  } catch (error) {
    console.error("Error reordering carousel slides:", error);
    response.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
};

module.exports = {
  getPageContent,
  postPageContents,
  updatePageContents,
  updatePageContentsWithImage,
  addCarouselItem,
  updateCarouselItem,
  deleteCarouselItem,
  getCarouselItems,
  reorderCarouselSlides,
};
