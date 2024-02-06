const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  name: 
  {  type: String,
   
     },
   code:{
    type: String
   }  ,
  discountPercentage: { 
    type: Number,
    
    },
  startDate:{
      type:Date
    },
  expirationDate: {
     type: Date,
   
     },
     users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
  }],
  

});
couponSchema.index({ expirationDate: 1 }, { expireAfterSeconds: 0 });


const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;
