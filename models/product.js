// const mongoose = require('mongoose');

// const productSchema = new mongoose.Schema({
//   name:{
//     type:String,
//     uppercase: true 
//   },
//   category: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Category'
//   },
//   color: String,
//   price: Number,
//   size: String,
//   material: String,
//   washcare: String,
//   stock: Number,
//   specification: String,
//   photos: [String], 
//   isBlocked: {
//     type: Boolean,
//     default: false
//   },
//   isNewArrival: {
//      type: Boolean, 
//      default: false }
// });

// const Product = mongoose.model('Product', productSchema);

// module.exports = Product;

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    uppercase: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  // variants: [
  //   {
  //     color: String,
  //     stock: Number,
  //     size: String,
    
  //   },
  // ],
  color: String,
  stock: Number,
  size: String,
  photos: [String],
  price: Number,
  material: String,
  washcare: String,
  specification: String,
  isBlocked: {
    type: Boolean,
    default: false,
  },
  isNewArrival: {
    type: Boolean,
    default: false,
  },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
