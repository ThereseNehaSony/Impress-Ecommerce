const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    name: String,
    addressline: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    mobile:Number,


    
  });
  const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
