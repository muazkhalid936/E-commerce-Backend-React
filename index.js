const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { log } = require("console");

app.use(express.json());
app.use(cors());

// Mongoose connection
mongoose.connect("mongodb://localhost:27017/e-commerce");

// API
app.get("/", (req, res) => {
  res.send("Express App is Running");
});

// Image engine
const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage: storage });

// Creating upload endpoint
app.use("/images", express.static("upload/images"));

app.post("/upload", upload.single("product"), (req, res) => {
  res.json({
    success: 1,
    image_url: `http://localhost:${port}/images/${req.file.filename}`,
  });
});

// Schema for creating products
const Product = mongoose.model("Product", {
  id: { type: Number, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  new_price: { type: Number, required: true },
  old_price: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  available: {
    type: Boolean,
    default: true,
  },
});

// Add product endpoint
app.post("/addproduct", async (req, res) => {
  let products = await Product.find({});
  let id = 0;

  if (products.length > 0) {
    let last_product = products[products.length - 1]; // Get the last product directly
    id = last_product.id + 1;
  } else {
    id = 1;
  }

  const product = new Product({
    id: id,  // Use the dynamically calculated id value here
    name: req.body.name,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });

  console.log(product);

  await product.save();
  console.log("saved");
  res.json({
    success: true,
    name: req.body.name,
  });
});

// Start the server
app.listen(port, (error) => {
  if (!error) {
    console.log("Server is running on Port", port);
  } else {
    console.log("Error:" + error);
  }
});
