const Wishlist = require('../models/wishlist');
const Cart = require('../models/cart');
const User = require('../models/user');
const Product = require('../models/product');
const Category = require('../models/category');
  

const wishlistController={
    showWishListPage:async(req,res)=>{
        try {
          const { userId } = req.session; 
          
         
          const userWishList = await Wishlist.findOne({ userId }).populate('products.productId').sort({ 'products.addedAt': -1 });
          req.session.user=userId
          res.render('user/wishlist', { userWishList }); 
      } catch (err) {
          console.error(err);
          res.status(500).json({ error: 'Internal server error' });
      }
    },
      
    addToWishList: async (req, res) => {
        try {
            const { userId, productId } = req.session;
            console.log(productId,"product id")
            let userWishList = await Wishlist.findOne({ userId });
            // console.log('oldCart:', userCart);
    // console.log(productId,"..........")
            if (!userWishList) {
                userWishList = new Wishlist({ userId, products: [{ productId, quantity: 1 }] });
                await userWishList.save();
  
            } else {
                
                const existingItem = userWishList.products.find(item => item.productId.toString() === productId);
    
                if (existingItem) {
                    
                    existingItem.quantity++;
                } else {
                   
                    userWishList.products.push({ productId, quantity: 1 });
                }
    
                await userWishList.save();
            }
    
    //         console.log('User Cart Before Operations:', userCart);
    // console.log(userCart.items,'..........')
            res.status(200).json({ message: 'Product added to cart successfully.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    removeFromWishList: async (req, res) => {
        try {
            // console.log("entered cart.......")
            const { userId } = req.session;
            const { productId } = req.body;
            // console.log((userId));
            // console.log(productId);
            let userCart = await Cart.findOne({ userId });
        //    console.log(userCart);
            if (!userCart) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            const updatedItems = userCart.items.filter(item => item.productId.toString() !== productId);
// console.log(updatedItems);
            if (userCart.items.length === updatedItems.length) {
                return res.status(404).json({ message: 'Product not found in cart' });
            }

            userCart.items = updatedItems;
            await userCart.save();
      
            req.flash('success', 'Product removed from cart successfully');
            res.status(200).json({ message: 'Product removed from cart successfully' });
        } catch (err) {
            // console.log("not entered cart.......")
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
}
module.exports=wishlistController