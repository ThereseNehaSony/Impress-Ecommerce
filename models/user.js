const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  phoneNumber: {
    type: String,
 
  },
  profilePicture: {
    type: String,
  },
  // verified: { 
  //   type: Boolean, 
  //   default: false 
  // },
  addresses:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
  }],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
