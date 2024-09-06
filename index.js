const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

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

//Scheme for User Model
const User = mongoose.model("User", {
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cartData: {
    type: Object,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

//Creating End-point to regiter User

app.post("/signup", async (req, res) => {
  let check = await User.findOne({ email: req.body.email });
  if (check) {
    return res
      .status(400)
      .json({ success: false, errors: "Existing User Found" });
  }
  let cart = {};
  for (let i = 0; i < 100; i++) {
    cart[i] = 0;
  }

  const user = new User({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  });

  await user.save();
  const data = {
    user: {
      id: user.id,
    },
  };
  const token = jwt.sign(data, "secret_ecom");
  res.json({ seccess: true, token });
});

//Login Api
app.post("/login", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    let passCompare = req.body.password === user.password;
    if (passCompare) {
      const data = {
        user: { id: user.id },
      };
      const token = jwt.sign(data, "secretc_ecom");
      res.json({ success: true, token });
    } else {
      res.json({ success: false, error: "Wrong Password" });
    }
  } else {
    res.json({ success: false, errors: "Wrong Email Id" });
  }
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
    id: id, // Use the dynamically calculated id value here
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

//Delete product

app.post("/removeproduct", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  console.log("removed");
  res.json({
    success: 1,
    name: req.body.name,
  });
});

// Get Product

app.get("/allproducts", async (req, res) => {
  let products = await Product.find({});
  console.log("All Products Fetched");
  res.send(products);
});

// Start the server
app.listen(port, (error) => {
  if (!error) {
    console.log("Server is running on Port", port);
  } else {
    console.log("Error:" + error);
  }
});
