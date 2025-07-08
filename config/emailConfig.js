const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false, // true para 465, false para outras portas
  auth: {
    user: process.env.EMAIL_USER,      // seu email (ex: seuemail@gmail.com)
    pass: process.env.EMAIL_PASS       // senha ou app password
  }
});

module.exports = transporter;
