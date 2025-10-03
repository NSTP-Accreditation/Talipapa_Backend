const mongoose = require('mongoose');

const connDB = async () => {
  try {
    // TODO: Use Dotenv for the path
    await mongoose.connect("mongodb+srv://Yannny:yanny@cluster0.jvfuoao.mongodb.net/TalipapaDB?retryWrites=true&w=majority&appName=Cluster0");
  } catch (error) {
    console.error(error); 
  }
}

module.exports = connDB;