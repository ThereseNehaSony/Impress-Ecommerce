const OTP = require('../models/otp');
const sendEmail = require('../services/nodemailer');
const generateOTP=require('../services/generateOtp')
const { AUTH_EMAIL } = process.env;



const sendOTP = async (email) => {
  try {
    if (!email) {
      throw Error('Provide a value for email');
    }


    const generatedOTP = await generateOTP();
    
    console.log('Generated OTP:', generatedOTP);
    
    const mailOptions = {
      from: AUTH_EMAIL,
      to: email,
      subject: 'Verify the email using this otp',
      html: `<p>Hello there, use this OTP to verify your email to continue:</p>
            <p style="color: tomato; font-size: 25px; letter-spacing: 2px;">
            <b>${generatedOTP}</b></p>
            <p>OTP will expire in <b>10 minute(s)</b>.</p>`
    };

    await sendEmail(mailOptions);

    
    const currentDate = new Date();
    const newDate = new Date(currentDate.getTime() + 10 * 60000); 
    const newOTP = new OTP({
      email,
      otp: generatedOTP,
      createdAt: currentDate,
      expireAt: newDate
    });

    const createdOTPRecord = await newOTP.save();
    return createdOTPRecord;
  } catch (err) {
    throw err;
  }
};

const verifyOTP = async (email, enteredOTP) => {
  try {
    const otpRecord = await OTP.findOne({ email, otp: enteredOTP });
    if (otpRecord && otpRecord.expireAt > Date.now()) {
      return true; 
    }
    return false; 
  } catch (err) {
    throw err;
  }
};

module.exports = { sendOTP, verifyOTP };
