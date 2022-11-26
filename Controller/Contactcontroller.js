const asyncHandler = require("express-async-handler");
const Contact = require("../Model/ContactModel");
const sendEmail = require("../utils/sendEmail");

const contactUs = asyncHandler(async (req, res) => {
  const { name, subject } = req.body;
  if (!name || !subject) {
    res.status(401);
    throw new Error("Please fill all the fields");
  }

  const contact = await Contact.create({ user: req.user.id, name, subject });

  const subjects = subject;
  const send_to = "demiladealuko111@gmail.com";
  const sent_from = process.env.EMAIL_USER;
  const reply_to = `oluwademiladealuko111@gmail.com`;

  if (contact) {
    await sendEmail(subjects, undefined, send_to, sent_from, reply_to);
    res
      .status(201)
      .json({ message: "Message receieved,we wil get back to you shortly" });
  } else {
    res.status(400);
    throw new Error("Contact not created");
  }
});

module.exports = { contactUs };
