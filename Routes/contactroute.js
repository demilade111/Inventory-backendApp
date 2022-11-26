const express = require("express");
const { contactUs } = require("../Controller/Contactcontroller");
const router = express.Router();
const verifyToken = require("../Middleware/authMiddlewear");

//Register route
router.post("/", verifyToken, contactUs);


module.exports = router;
