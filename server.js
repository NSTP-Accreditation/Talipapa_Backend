const express = require('express');
const app = express();
const path = require('path');
const port = 5555;
const connDB = require('./config/connDB')
const mongoose = require('mongoose');
const cors = require('cors');
const corsConfig = require('./config/corsConfig');
const cookieParser = require('cookie-parser');

// This is to use the .env files
require('dotenv').config();

// Connect to db
connDB();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(cookieParser());
app.use(cors(corsConfig));

// app.use(express.static(path.join(__dirname, 'publ
// ic'))); // Optional since wala pa namang public directory

// Auth Endpoint
app.use('/auth', require('./routes/auth'));


// ENDPOINTS
app.use('/news', require('./routes/api/newsRoute'));

mongoose.connection.once("open", () => {
  console.log('Connected To DB');

  app.listen(port, () => console.log(`Server is listening to port ${port}`));
});