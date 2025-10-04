const mongoose = require('mongoose');

const connDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
  } catch (error) {
    console.error(error); 
  }
}

module.exports = connDB;