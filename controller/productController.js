const Product = require("../model/Products");

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
    response.status(201).json({ message: `Product ${newProduct.name} Created!` });
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
