const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDIN_EMAIL_ADD,
    pass: process.env.SENDIN_EMAIL_PASS,
  },
});

module.exports = transport