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
            const { userId } = req.session; // Assuming you have the user's ID in the session
            const { productId } = req.params;
    
            // Validate the request data
            if (!userId || !productId) {
                return res.status(400).json({ error: 'Invalid request data' });
            }
    
            // Remove the product from the wishlist
            await Wishlist.findOneAndUpdate(
                { userId },
                { $pull: { products: { productId } } },
                { new: true }
            );
    
            res.status(200).json({ message: 'Product removed from wishlist successfully.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    addtocart:async (req, res) => {
        try {
            const { userId } = req.session; // Assuming you have the user's ID in the session
    
            const { productId } = req.params; // Get productId from the route parameter
            const { quantity } = req.body;
    
            // Validate the request data
            if (!userId || !productId || !quantity || quantity <= 0) {
                return res.status(400).json({ error: 'Invalid request data' });
            }
    
            // Check if the user already has a cart
            let userCart = await Cart.findOne({ userId });
    
            if (!userCart) {
                // If the user doesn't have a cart, create a new one
                userCart = new Cart({ userId, items: [{ productId, quantity }] });
                await userCart.save();
            } else {
                // If the user has a cart, update the existing one
                const existingItem = userCart.items.find(item => item.productId.toString() === productId);
    
                if (existingItem) {
                    existingItem.quantity += quantity;
                } else {
                    userCart.items.push({ productId, quantity });
                }
    
                await userCart.save();
            }
    
            // Remove the product from the wishlist after adding it to the cart
            await Wishlist.findOneAndUpdate(
                { userId },
                { $pull: { products: { productId } } },
                { new: true }
            );
    
            res.status(200).json({ message: 'Product added to cart from wishlist successfully.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    
}
module.exports=wishlistController