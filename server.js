const express = require("express");
const app = express();
const path = require("path");
const port = 5555;
const connDB = require("./config/connDB");
const mongoose = require("mongoose");
const cors = require("cors");
const corsConfig = require("./config/corsConfig");
const cookieParser = require("cookie-parser");

// This is to use the .env files
require("dotenv").config();

// Connect to db
connDB();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors(corsConfig));

// app.use(express.static(path.join(__dirname, 'publ
// ic'))); // Optional since wala pa namang public directory

// Auth Endpoint
app.use("/auth", require("./routes/auth"));

// ENDPOINTS
app.use('/users', require('./routes/api/userRoute'));

app.use("/news", require("./routes/api/newsRoute"));

app.use("/pagecontent", require("./routes/api/pageContentRoute"));

app.use("/achievements", require("./routes/api/achievementsRoute"));

app.use("/products", require("./routes/api/productsRoute"));

app.use("/materials", require("./routes/api/materialsRoute"));

app.use("/records", require("./routes/api/recordRoute"));

app.use("/guidelines", require("./routes/api/guidelinesRoute"));

app.use("/officials", require("./routes/api/officialsRoute"));

app.use("/farms", require("./routes/api/farmRoute"));

app.use("/logs", require("./routes/api/logsRoute"));

app.use("/security", require("./routes/api/securityRoute"));

app.use("/skills", require("./routes/api/skillsRoute"));

app.use("/staff", require("./routes/api/staffRoute"));

app.use("/talipapanatin", require("./routes/api/talipapanatinRoute"));

app.use("/farm-inventory", require("./routes/api/farmInventoryRoute"));

app.use('/establishment', require('./routes/api/establishmentRoute'));


mongoose.connection.once("open", () => {
  console.log("Connected To DB");

  app.listen(port, () => console.log(`Server is listening to port ${port}`));
});
