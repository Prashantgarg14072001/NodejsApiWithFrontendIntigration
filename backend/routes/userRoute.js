const express  = require('express');
const router = express.Router();
const {signup, verifyOTP, login, resendOTP} = require('../controllers/userAuth');
router.post("/signup",signup);
router.put("/verifyOTP",verifyOTP)
router.post("/login", login)
router.put('/resendOTP', resendOTP);
// router.get("/", (req, res) => {
//   res.send("Welcome to the application");
// });
module.exports=router;