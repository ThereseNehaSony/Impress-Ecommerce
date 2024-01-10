// const mongoose=require('mongoose')
// require('dotenv').config()

// const OtpSchema = new mongoose.Schema({
//   otp: {
//    type: String
// },
//   email: {
//   type: String
// },
// expireAt: { type: Date, default: Date.now, index: { expires: '10m' } }
// });

// const collectionName = process.env.OTP_COLLECTION || 'Otp';
// const otp = mongoose.model(collectionName, OtpSchema);

// module.exports = otp;

const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
  otp: {
    type: String
  },
  email: {
    type: String
  },
  expireAt: { type: Date, default: Date.now, index: { expires: '10m' } }
});

const otp = mongoose.model('otp', OtpSchema); // Collection name set to 'otp'

module.exports = otp;
