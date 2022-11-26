const User = require("../Model/Usermodel");
const Token = require("../Model/tokenModel");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, bio, photo, phone } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill all fields");
  } else {
    //Check if user already exists in the database
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      throw new Error("User already exists");
    }

    // Create a new user in the Database
    const user = await User.create({
      name,
      email,
      password,
      bio,
      photo,
      phone,
    });
    const token = generateToken(user._id);

    // if user is already create we should send a response to the user
    if (user) {
      res.status(201).json({
        message: "User created successfully",
        _id: user._id,
        name,
        photo,
        bio,
        email,
        phone,
        token,
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data"); // error message if user are not created
    }
  }
});

const LoginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }); // check if user exists in the database

  if (!user) {
    throw new Error("User not found, please signup");
  } else {
    const comparePasswords = await bcrypt.compare(password, user.password);

    if (user && comparePasswords) {
      const token = generateToken(user._id);

      res.status(200).json({
        message: "User logged in successfully",
        user: user._id,
        name: user.name,
        photo: user.photo,
        bio: user.bio,
        email: user.email,
        phone: user.phone,
        token,
      });
    }
  }
});

const LogoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    path: "/",
    secure: false,
    httpOnly: false,
    sameSite: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "User logged out successfully" });
});

//get user data
const getUser = asyncHandler(async (req, res) => {
  const user = await User.find(req.user._id);

  if (!user) {
    res.status(401);
    throw new Error("User not found");
  } else {
    res.status(200).json({
      message: "User data fetched successfully",
      userId: user._id,
      name: user.name,
      photo: user.photo,
      bio: user.bio,
      email: user.email,
      phone: user.phone,
    });
  }
});

const loggedinStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(401);
    throw new Error("Not authorized, please login");
  } else {
    res.status(200).json({ message: "User is logged in" });
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }
  if (user) {
    const { email, photo, phone, bio, name } = user;

    user.email = email;
    user.photo = req.body.photo || photo;
    user.phone = req.body.phone || phone;
    user.bio = req.body.bio || bio;
    user.name = req.body.name || name;
  }

  const updatedUser = await user.save();

  res
    .status(200)
    .json({ updateUser: updatedUser, message: "User updated successfully" });
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    res.status(400);
    throw new Error("Please fill all fields");
  }
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(401);
    throw new Error("User not found please Signup");
  } else {
    const comparePasswords = await bcrypt.compare(oldPassword, user.password);

    if (user && comparePasswords) {
      user.password = newPassword;
    }
    const updatedUser = await user.save();
    res.status(200).json({
      updateUser: updatedUser,
      message: "Password updated successfully",
    });
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).send("user with given email doesn't exist");
  }
  // Delete token if it exists in DB
  let token = await Token.findOne({ userId: user._id });
  if (token) {
    await token.deleteOne();
  }

  // Create ResetToken
  let resetToken = crypto.randomBytes(32).toString("hex") + user._id;

  // Hash token before saving to DB
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Save Token to DB
  await new Token({
    userId: user._id,
    token: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * (60 * 1000), // Thirty minutes
  }).save();
  //construct reset url
  const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
  //reset email
  const message = `
      <h2>Hello ${user.name}</h2>
      <p>Please use the url below to reset your password</p>  
      <p>This reset link is valid for only 30minutes.</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
      <p>Regards...</p>`;
  const subject = "Password Reset Request";
  const send_to = user.email;
  const sent_from = process.env.EMAIL_USER;
  const reply_to = `oluwademiladealuko111@gmail.com`;
  try {
    await sendEmail(subject, message, send_to, sent_from, reply_to);
    res.status(200).json({ success: true, message: "Reset Email Sent" });
  } catch (error) {
    res.status(500);
    throw new Error("Email not sent, please try again");
  }
});

//reset password
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const resetToken = req.params.resetToken;
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  // fIND tOKEN in DB
  const userToken = await Token.findOne({
    token: hashedToken,
    expiresAt: { $gt: Date.now() },
  });
  if (!userToken) {
    res.status(404);
    throw new Error("Invalid or Expired Token");
  }

  // Find user
  const user = await User.findOne({ _id: userToken.userId });
  user.password = password;
  await user.save();
  res.status(200).json({
    message: "Password Reset Successful, Please Login",
  });
});

module.exports = {
  registerUser,
  LoginUser,
  LogoutUser,
  getUser,
  updateUser,
  forgotPassword,
  loggedinStatus,
  changePassword,
  resetPassword,
};
