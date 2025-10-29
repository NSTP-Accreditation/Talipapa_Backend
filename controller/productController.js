const Product = require("../model/Products");
const { createLog } = require("../utils/logHelper");
const { LOGCONSTANTS } = require("../config/constants");
const { deleteFromS3 } = require("../utils/deleteFromS3");

const getProducts = async (request, response) => {
  try {
    const products = await Product.find();
    if (!products)
      return response.status(204).json({ message: "No Products found" });
    response.json(products);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const createProduct = async (request, response) => {
  const { name, description, category, subCategory, stocks, requiredPoints } =
    request.body;

  if (!name || !description || !category || !subCategory || !requiredPoints)
    return response.status(400).json({ error: "All Fields are required!" });
  
  if(isNaN(stocks) || isNaN(requiredPoints) || stocks < 0 || requiredPoints <= 0) {
    return response.status(400).json({ error: "Stocks and Required Points should be a number" });
  }

  if (!request.file) {
    return response.status(400).json({
      success: false,
      message: "Product image is required",
    });
  }

  try {
    const foundProduct = await Product.findOne({ name });
    if (foundProduct)
      return response
        .status(409)
        .json({ message: `Product: ${name} already exists` });

    const newProduct = await Product.create({
      name,
      description,
      category,
      subCategory,
      stocks:  Number(stocks),
      requiredPoints: Number(requiredPoints),
      image: {
        url: request.file.location,
        key: request.file.key,
        originalName: request.file.originalname,
        size: request.file.size,
        mimetype: request.file.mimetype,
      },
    });

    await createLog({
      action: LOGCONSTANTS.actions.products.CREATE_PRODUCT,
      category: LOGCONSTANTS.categories.INVENTORY,
      title: "New Product Created",
      description: `Product "${name}" was added to inventory`,
      performedBy: request.userId,
    });

    response
      .status(201)
      .json({ 
        message: `Product ${newProduct.name} Created!`,
        product: newProduct
      });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const updateProduct = async (request, response) => {
  const { id } = request.params;
  const { name, description, category, subCategory, stocks, requiredPoints } =
    request.body;

  if (!id) {
    return response.status(400).json({ message: "Product ID is required!" });
  }

  if (!name || !description || !category || !subCategory || !requiredPoints) {
    return response.status(400).json({ error: "All Fields are required!" });
  }

  if (isNaN(stocks) || isNaN(requiredPoints) || stocks < 0 || requiredPoints <= 0) {
    return response.status(400).json({ error: "Stocks and Required Points should be valid numbers" });
  }

  try {
    const product = await Product.findById(id);

    if (!product) {
      return response
        .status(404)
        .json({ message: `Product not found with ID: ${id}` });
    }

    // Prepare update data
    const updateData = {
      name,
      description,
      category,
      subCategory,
      stocks: Number(stocks),
      requiredPoints: Number(requiredPoints),
      updatedAt: new Date(),
    };

    if (request.file) {
      if (product.image && product.image.key) {
        try {
          await deleteFromS3(product.image.key);
        } catch (s3Error) {
          console.error("Failed to delete old image from S3:", s3Error);
        }
      }

      // Add new image
      updateData.image = {
        url: request.file.location,
        key: request.file.key,
        originalName: request.file.originalname,
        size: request.file.size,
        mimetype: request.file.mimetype,
      };
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).lean();

    if (!updatedProduct) {
      return response
        .status(404)
        .json({ message: `Product not found with ID: ${id}` });
    }

    // Log product update
    await createLog({
      action: LOGCONSTANTS.actions.products.UPDATE_PRODUCT,
      category: LOGCONSTANTS.categories.INVENTORY,
      title: "Product Updated",
      description: `Product "${name}" was updated${request.file ? ' with new image' : ''}`,
      performedBy: request.userId,
      targetType: LOGCONSTANTS.targetTypes.PRODUCT,
      targetId: updatedProduct._id.toString(),
      targetName: name,
      details: {
        category,
        subCategory,
        stocks: Number(stocks),
        requiredPoints: Number(requiredPoints),
        imageUpdated: !!request.file
      }
    });

    response.json({ 
      message: "Product updated successfully!",
      product: updatedProduct
    });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const deleteProduct = async (request, response) => {
  const { id } = request.params;

  if (!id) return response.status(400).json({ message: "ID is required!" });

  try {
    const foundProduct = await Product.findById(id);
    if (!foundProduct)
      return response
        .status(404)
        .json({ message: `Product not found with ID ${id}` });

    if (foundProduct.image && foundProduct.image.key) {
      try {
        await deleteFromS3(foundProduct.image.key);
      } catch (s3Error) {
        console.error("Failed to delete image from S3:", s3Error);
      }
    }
        
    await createLog({
      action: LOGCONSTANTS.actions.products.DELETE_PRODUCT,
      category: LOGCONSTANTS.categories.INVENTORY,
      title: `Product "${foundProduct.name}" was deleted`,
      description: `Product "${foundProduct.name}" was deleted`,
      performedBy: request.userId,
      targetType: LOGCONSTANTS.targetTypes.PRODUCT,
      targetName: foundProduct.name,
    });
    
    await Product.deleteOne({ _id: id });
    response.json({ message: "Product Deleted Successfully" });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };
