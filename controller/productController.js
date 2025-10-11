const Product = require("../model/Products");
const { createLog } = require("../utils/logHelper");

// TODO: ADD IMAGE AND UPDATE PRODUCT
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
      stocks,
      requiredPoints,
    });

    // Log product creation
    await createLog({
      action: 'PRODUCT_CREATE',
      category: 'INVENTORY',
      title: 'New Product Created',
      description: `Product "${name}" was added to inventory`,
      performedBy: req.user,
      targetType: 'PRODUCT',
      targetId: newProduct._id.toString(),
      targetName: name,
      details: { category, subCategory, requiredPoints, stocks },
      ipAddress: req.ip,
      status: 'SUCCESS'
    });

    res.status(201).json({ message: `Product ${newProduct.name} Created!` });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

const updateProduct = async (request, response) => {
  const { id } = request.params;
  const { name, description, category, subCategory, stocks, requiredPoints } =
    request.body;

  if (!name || !description || !category || !subCategory || !requiredPoints)
    return response.status(400).json({ error: "All Fields are required!" });

  try {
    const oldProduct = await Product.findById(id).lean();
    
    const updatedProduct = await Product.findByIdAndUpdate(id, {
      name,
      description,
      category,
      subCategory,
      stocks,
      requiredPoints,
    }, { new: true }).lean();

    if(!updatedProduct) {
      return response.status(404).json({ message: `Product not found with ID: ${id}`})
    }

    // Log product update
    await createLog({
      action: 'PRODUCT_UPDATE',
      category: 'INVENTORY',
      title: 'Product Updated',
      description: `Product "${name}" was updated`,
      performedBy: request.user,
      targetType: 'PRODUCT',
      targetId: id,
      targetName: name,
      details: { 
        before: oldProduct,
        after: updatedProduct 
      },
      ipAddress: request.ip,
      status: 'SUCCESS'
    });

    response.json(updatedProduct);
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

    await Product.deleteOne({ _id: id });

    response.json({ message: "Product Deleted Successfully" });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };
