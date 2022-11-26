const express = require("express");
const router = express.Router();
const {
  registerUser,
  LoginUser,
  LogoutUser,
  getUser,
  loggedinStatus,
  updateUser,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../Controller/userController");
const verifyToken = require("../Middleware/authMiddlewear");

//Register route
router.post("/register", registerUser);
router.post("/login", LoginUser);
router.get("/logout", LogoutUser);
router.get("/user", verifyToken, getUser);
router.get("/loggedin", loggedinStatus);
router.patch("/updateuser", verifyToken, updateUser);
router.patch("/changePassword", verifyToken, changePassword);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resetToken", resetPassword);

module.exports = router;
