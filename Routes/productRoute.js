const express = require("express");
const router = express.Router();
const {
  getProduct,
  createProduct,
  getSingleProduct,
  deleteProduct,
  updateProduct,
} = require("../Controller/productController");
const verifyToken = require("../Middleware/authMiddlewear");
const { upload } = require("../utils/fileupload");

router.get("/", verifyToken, getProduct);
router.post("/", verifyToken, upload.single("image"), createProduct);
router.get("/:id", verifyToken, getSingleProduct);
router.get("/:id", verifyToken, deleteProduct);
router.patch("/:id", verifyToken, upload.single("image"), updateProduct);

module.exports = router;
