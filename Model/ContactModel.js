const mongoose = require("mongoose");

const contactSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
    },

    subject: {
      type: String,
      required: [true, "Please add a Subject"],
    },
  },
  {
    timestamps: true,
  }
);

const contact = mongoose.model("Contact", contactSchema);
module.exports = contact;
