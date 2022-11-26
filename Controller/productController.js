const asyncHandler = require("express-async-handler");
const Product = require("../Model/productModel");
const { fileSizeFormatter } = require("../utils/fileupload");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const getProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.find({ user: req.user._id }).sort(
      "-createdAt"
    );
    res.status(200).json(product);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});
//get single product from the database with params id
const getSingleProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById({ _id: req.params.id });
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  // Match product to its user
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }
  res.status(200).json(product);
});
const createProduct = asyncHandler(async (req, res) => {
  const { name, price, description, category, quantity } = req.body;

  if (!name || !price || !description || !category || !quantity) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }

  //manage product Image and upload to cloudinary
  let fileData = {};

  if (req.file) {
    fileData = {
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      fileType: fileSizeFormatter(req.file.mimetype, 2),
    };
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "Inventory App",
        resource_type: "image",
      });
    } catch (error) {
      res.status(500);
      throw new Error("Image could not be uploaded");
    }
  }

  const product = await Product.create({
    user: req.user.id,
    name,
    price,
    description,
    category,
    quantity,
    image: fileData,
  });
  if (product) {
    res.status(201).json(product);
  } else {
    res.status(400);
    throw new Error("product not Created");
  }
});

// Delete Product
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  // if product doesnt exist
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  // Match product to its user
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }
  await product.remove();
  res.status(200).json({ message: "Product deleted." });
});

// Update Product
const updateProduct = asyncHandler(async (req, res) => {
  const { name, category, quantity, price, description } = req.body;
  const { id } = req.params;

  const product = await Product.findById(id);

  // if product doesnt exist
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  // Match product to its user
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }

  // Handle Image upload
  let fileData = {};
  if (req.file) {
    // Save image to cloudinary
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "Pinvent App",
        resource_type: "image",
      });
    } catch (error) {
      res.status(500);
      throw new Error("Image could not be uploaded");
    }

    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }

  // Update Product
  const updatedProduct = await Product.findByIdAndUpdate(
    { _id: id },
    {
      name,
      category,
      quantity,
      price,
      description,
      image: Object.keys(fileData).length === 0 ? product?.image : fileData,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json(updatedProduct);
});

module.exports = {
  getProduct,
  createProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};
