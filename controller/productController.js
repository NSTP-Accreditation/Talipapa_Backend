const Product = require('../model/Products');

// TODO: ADD IMAGE AND UPDATE PRODUCT
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    if(!products) return res.status(204).json({'message': 'No Products found'});    
    res.json(products);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

const createProduct = async (req, res) => {
  const { name, description, category, subCategory, stocks, requiredPoints } = req.body;
  
  if(!name || !description || !category || !subCategory || !requiredPoints ) return res.status(400).json({ 'error': "All Fields are required!"});

  try {
    const foundProduct = await Product.findOne({ name });
    if(foundProduct) return res.status(409).json({ message: `Product: ${name} already exists` })

    const newProduct = await Product.create({
      name,
      description,
      category,
      subCategory,
      stocks,
      requiredPoints
    });
    res.status(201).json({ message: `Product ${newProduct.name} Created!`});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getProducts, createProduct };