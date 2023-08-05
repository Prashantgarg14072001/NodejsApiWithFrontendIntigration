const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'prashant@indicchain.com',
    pass: 'turhwjqjtvpyigsd'
  }
});

const sendMail = (email, otp) => {
  const mailOptions = {
    from: 'prashant@indicchain.com',
    to: email,
    subject: 'Verify Your Account',
    text: `Please verify your account using the following OTP: ${otp}`
  };

  return transporter.sendMail(mailOptions);
}

const generateOTP = () => {
  const otp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
  const otpExpiration = Date.now() + 3 * 60 * 1000;
  return { otp: otp.toString(), otpExpiration };
}

module.exports = {
  generateOTP,
  sendMail,
  
}