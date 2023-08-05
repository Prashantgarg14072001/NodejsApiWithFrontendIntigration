const User = require('../models/userModel');
const {generateOTP, sendMail} = require('../common/helper');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require("dotenv").config();

// Signup
exports.signup = async (req, res) => {
  try {
    const {
      firstName, lastName, email, mobileNumber, countryCode, userName, password, address, dateOfBirth, userType
    } = req.body;
    const requiredFields = ["firstName", "lastName", "email", "mobileNumber", "countryCode", "userName", "password", "address", "dateOfBirth"];
    const missingFields = [];
    requiredFields.forEach((field) => {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    });
    if (missingFields.length > 0) {
      const errorMessage = missingFields.map(field => `${field} is required`);
      return res.status(400).json({
        responseCode: 400,
        responseMessage: errorMessage
      });
    }

    const userExist = await User.findOne({ email: email, status: { $ne: 'deleted' }, userType: "USER" });
    if (userExist) {
      if (userExist.status === 'blocked') {
        return res.status(403).json({
          responseCode: 403,
          responseMessage: "Your Account is blocked"
        });
      }
      return res.status(409).json({
        responseCode: 409,
        responseMessage: "Your Account already exists"
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { email: email },
        { mobileNumber: mobileNumber },
        { userName: userName }
      ]
    }).exec();

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(401).json({ responseMessage: 'Email already exists', responseCode: 401, error: [] });
      } else if (existingUser.mobileNumber === mobileNumber) {
        return res.status(401).json({ responseMessage: 'Mobile Number already exists', responseCode: 401, error: [] });
      } else if (existingUser.userName === userName) {
        return res.status(401).json({ responseMessage: 'Username already exists', responseCode: 401, error: [] });
      }
    }

    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (err) {
      return res.status(500).json({
        success: false,
        responseCode: 500,
        message: "Error in hashing password"
      });
    }

    const { otp,otpExpiration  } = generateOTP();
    const newUser = {
      firstName,
      lastName,
      email,
      mobileNumber,
      countryCode,
      userName,
      password: hashedPassword,
      address,
      dateOfBirth,
      userType,
      otp:otp,
      otpGenerationTime:otpExpiration 
    }
    await User.create(newUser);

    try {
      await sendMail(email, otp);
      console.log(`OTP sent to ${email}`);
      return res.status(201).json({ responseMessage: 'User registered successfully', responseCode: 200 });
     // return res.redirect('/otpValidation.html');
    } catch (error) {
      console.error(`Error sending OTP to ${email}:`, error);
      return res.status(500).json({ responseMessage: 'Error sending OTP', responseCode: 500 });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ responseMessage: 'Internal server error', responseCode: 500 });
  }

};

// OTP verification
// exports.verifyOTP = async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     if (!email) {
//       res
//         .status(400)
//         .json({ responseCode: 400, responseMessage: "email is Required" });
//     } else if (!otp) {
//       res.status(400).json({
//         responseCode: 400,
//         responseMessage: "otp is Required",
//       });
//     } else {
//       const check = await User.findOne({ email });
//       const storedOtp = req.body.otp;
      
//       if (storedOtp === check.otp) {
//         if (check.otpGenerationTime < Date.now()) {
//           res
//             .status(498)
//             .json({ responseCode: 498, responseMessage: "otp is expired" });
//         } else {
//           await User.updateOne(
//             {
//               email: check.email,
//             },
//             {
//               $set: { isOTP: true },
//               $unset: { otp: 1, expirationTime: 1 },
//             }
//           );
//           return res.status(200).json({
//             responseCode: 200,
//             responseMessage: "Otp verified Successfully*_*!",
//           });
//         }
//       }
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(501).json({
//       responseCode: 501,
//       responseMessage: "internal server error",
//       responseResult: error,
//     });
//   }
// },
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email) {
      return res.status(400).json({ responseCode: 400, responseMessage: "Email is required" });
    } else if (!otp) {
      return res.status(400).json({ responseCode: 400, responseMessage: "OTP is required" });
    } else {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ responseCode: 404, responseMessage: "User not found" });
      }

      const storedOtp = parseInt(user.otp); // Convert stored OTP to an integer for comparison
      const enteredOtp = parseInt(otp); // Convert entered OTP to an integer for comparison

      if (storedOtp === enteredOtp) {
        if (user.otpGenerationTime < Date.now()) {
          return res.status(498).json({ responseCode: 498, responseMessage: "OTP has expired" });
        } else {
          await User.updateOne(
            { email: user.email },
            { $set: { isOTP: true }, $unset: { otp: 1, otpGenerationTime: 1 } }
          );
          return res.status(200).json({ responseCode: 200, responseMessage: "OTP verified successfully!" });
        }
      } else {
        return res.status(401).json({ responseCode: 401, responseMessage: "Invalid OTP. OTP verification failed!" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ responseCode: 500, responseMessage: "Internal server error", responseResult: error });
  }
};



//login
// exports.login= async (req,res)=>{
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         responseMessage: 'Please fill all the details carefully',
//         responseCode: 400
//       });
//     }

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         responseCode: 401,
//         responseMessage: 'User is not Registered'
//       });
//     }

//     if (!user.isOTP) {
//       return res.status(403).json({
//         success: false,
//         responseCode: 403,
//         responseMessage: 'OTP verification pending. Please verify your OTP before logging in.'
//       });
//     }

//     const isPasswordCorrect = await bcrypt.compare(password, user.password);

//     if (isPasswordCorrect) {
//       const payload = {
//         email: user.email,
//         id: user._id
//       };

//       const token = jwt.sign(payload, process.env.JWT_SECRET, {
//         expiresIn: '1h',
//       });

//       return res.status(200).json({
//         success: true,
//         responseCode: 200,
//         responseMessage: 'Login successful',
//         token: token
//       });
//     } else {
//       return res.status(403).json({
//         success: false,
//         responseCode: 403,
//         responseMessage: 'Incorrect Password'
//       });
//     }
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       responseCode: 500,
//       responseMessage: 'Internal server error'
//     });
//   }
// };
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        responseMessage: 'Please fill all the details carefully',
        responseCode: 400
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        responseCode: 401,
        responseMessage: 'User is not Registered'
      });
    }

    if (!user.isOTP) {
      return res.status(403).json({
        success: false,
        responseCode: 403,
        responseMessage: 'OTP verification pending. Please verify your OTP before logging in.'
      });
    }

    const payload = {
      email: user.email,
      id: user._id
    };

    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1h'
      });

      return res.status(200).json({
        success: true,
        responseCode: 200,
        responseMessage: 'Login successful',
        token: token
      });
    } else {
      return res.status(403).json({
        success: false,
        responseCode: 403,
        responseMessage: 'Password Incorrect'
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      responseCode: 500,
      responseMessage: 'Internal server error'
    });
  }
};
// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        responseCode: 404,
        responseMessage: "User not found"
      });
    }
    if (user.isOTP) {
      return res.status(400).json({
        responseCode: 400,
        responseMessage: "OTP has already been verified"
      });
    }
    const { otp, otpExpirationTime } = generateOTP();
    user.otp = otp;
    user.otpGenerationTime = new Date();
    await user.save();
    await sendMail(email, otp);
    return res.status(200).json({
      responseCode: 200,
      responseMessage: "OTP has been resent"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      responseCode: 500,
      responseMessage: "Internal server error"
    });
  }
};
//Get User Data Fetch
// exports.getAllData = async(req, res)=>{
//  try {
//   const userData = await User.findById({_id:req.body},{_id:0,password:0,status:0,userType:0,otpExpirationtime:0,isOTP:0});
//   if(!userData){
//     return res.status(400).json({
//       responseCode:400,
//       success:false,
//       responseMessage:"User data not found"
//     })
//   }else{
//     return res.status(200).json({
//       responseCode:400,
//       success:f alse,
//       responseMessage:"User data found", userData
//     })
//   }
//  } catch (error) {
//   console.error(error)
//  }
// }