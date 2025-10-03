const express = require('express');
const app = express();
const path = require('path');
const port = 5555;
const connDB = require('./config/connDB');
const mongoose = require('mongoose');

// This is to use the .env files
require('dotenv').config;

// Connect to db
connDB();


console.log(process.env.SAMPLE);
// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false}));
// app.use(express.static(path.join(__dirname, 'public'))); // Optional since wala pa namang public directory

app.get("/", (req, res) => {
  res.send("hello world");
})

mongoose.connection.once("open", () => {
  console.log('Connected To DB');

  app.listen(port, () => console.log(`Server is listening to port ${port}`));
});

