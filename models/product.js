

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
  productDiscountedPrice: {
    type: Number,
  },
  productOffer:{
  type:Number
},
categoryDiscountedPrice: {
  type: Number,
},
categoryOffer:{
type:Number
},
});

productSchema.index({ name: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
