const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  name: 
  {  type: String,
    //  required: true, 
    //  uppercase:true
     },
   code:{
    type: String
   }  ,
  discountAmount: { 
    type: Number,
    //  required: true 
    },
  startDate:{
      type:Date
    },
  expirationDate: {
     type: Date,
    //  required:true
     },
  maxUsage: {
    type:Number
  },
  

});
couponSchema.index({ expirationDate: 1 }, { expireAfterSeconds: 0 });


const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;
