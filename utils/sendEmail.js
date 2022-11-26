const nodemailer = require("nodemailer");
const sendEmail = async (subject, message, send_to, send_from, reply_to) => {
  try {
    //Create Transpoter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
      port: 587,
      secure: true,
    });

    const options = await transporter.sendMail({
      from: send_from,
      to: send_to,
      subject: subject,
      replyTo: reply_to,
      html: message,
    });

    transporter.sendMail(options, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(info);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = sendEmail;
