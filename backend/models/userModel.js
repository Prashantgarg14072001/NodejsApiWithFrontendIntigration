const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  email: {
    type: String
  },
  mobileNumber: {
    type: Number
  },
  countryCode: {
    type: String
  },
  userName: {
    type: String
  },
  password: {
    type: String
  },
  address: {
    type: String
  },
  dateOfBirth: {
    type: String
  },
  status: {
    type: String,
    enum: ['Active', 'Blocked', 'Deleted'],
    default: 'Active'
  },
  otp: {
    type: Number
  },
  otpGenerationTime: {
    type: Date
  },
  userType: {
    type: String,
    enum: ['USER', 'Admin']
  },
  isOTP: {
    type: Boolean,
    default: false
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
