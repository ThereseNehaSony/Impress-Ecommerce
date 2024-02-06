const Cart = require('../models/cart');
const User = require('../models/user');
const Product = require('../models/product');
const Category = require('../models/category');
const Address= require("../models/address")
const Wallet= require("../models/wallet")
const Wishlist=require("../models/wishlist")

const cartController={
     //cart---------------------------------------------------
     showCartPage:async(req,res)=>{
        try {
          const { userId } = req.session; 
          
         
          const userCart = await Cart.findOne({ userId }).populate('items.productId');
          req.session.user=userId
          res.render('user/cart', { userCart }); 
      } catch (error) {
        
        next(error);
      }
    },
      
    addToCart: async (req, res) => {
        try {
            const { userId,productId} = req.session
            console.log(req.session);
        
            console.log(userId,",,,,,,,,,,,,,,,,userid")
            console.log(productId,"...productId")
            const {quantity}=req.body
            let userCart = await Cart.findOne({ userId });
            console.log('qty:', quantity);
            console.log(productId,"..........")
            if (!userCart) {
                userCart = new Cart({ userId, items: [{ productId, quantity: quantity }] });
                await userCart.save();
                // console.log('Created New Cart:', userCart);
            } else {
               
                const existingItem = userCart.items.find(item => item.productId.toString() === productId);
    
                if (existingItem) {
                   
                    existingItem.quantity += quantity;
                } else {
                    
                    userCart.items.push({ productId, quantity });
                }
    
                await userCart.save();
            }
            
    
    //         console.log('User Cart Before Operations:', userCart);
    // console.log(userCart.items,'..........')
            res.status(200).json({ message: 'Product added to cart successfully.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    removeFromCart: async (req, res) => {
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
    updateCartItemQuantity: async (req, res) => {
        const { cartItemId, quantityChange } = req.body;
    
        try {
            const { userId } = req.session;
            const userCart = await Cart.findOne({ userId });
    
            if (!userCart) {
                return res.status(404).json({ message: 'User cart not found' });
            }
    
            
            const cartItemIndex = userCart.items.findIndex(item => item._id.toString() === cartItemId);
    
            if (cartItemIndex === -1) {
                return res.status(404).json({ message: 'Cart item not found' });
            }
    
           
            userCart.items[cartItemIndex].quantity += quantityChange;
    
            await userCart.save();
 
            const product = await Product.findById(userCart.items[cartItemIndex].productId);
    
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
    
           
            const newTotalPrice = (product.productDiscountedPrice || product.categoryDiscountedPrice || product.price) * userCart.items[cartItemIndex].quantity;
             console.log(newTotalPrice,"pppppppppppppppp")
       
            res.json({ quantity: userCart.items[cartItemIndex].quantity, newTotalPrice });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    
    
    
    
      getCheckOutPage:async(req,res)=>{
        try {
            const { userId } = req.session; 
            const email=req.session.email;  
            const discountAmount = req.session.discount 
            const user = await User.findOne({ email: email }).populate('addresses');
           console.log(email)
            // const productId=req.session.productId
            // if(productId){
            // const product=await Product.findById(productId)
            // if (!product) {
            //     return res.status(404).send('Product not found');
            // }
        //     return res.render('user/checkout', { product });
        //    }else{
            const userCart = await Cart.findOne({ userId }).populate('items.productId');
           
            res.render('user/checkout', { userCart, addresses: user.addresses, discountAmount}); 
        }
    catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
      },
     getPaymentSuccessPage:async(req,res)=>{
       try {
        const { userId }=req.session;
        const userCart= await Cart.findOne({userId}).populate("items.productId")
        res.render("user/paymentsuccess",{userCart})
       } catch (error) {
        console.error(error);
        res.status(500).json({error:'Internal server errror'})
       }
     },
     getPlaceOrderPage:async(req,res)=>{
        try {
            const { userId }=req.session;
            const { selectedAddressId } = req.session
            const paymentMethod= req.session.paymentMethod ;
            const discountAmount = req.session.discount 
            const selectedAddress = await Address.findById(selectedAddressId);
            const userCart= await Cart.findOne({userId}).populate("items.productId")
        
const discount= req.session.discount
console.log("discount,,,,,,,,,,,,,,,,,,,,,,,,,,,,,")
            let totalPrice = 0;

            userCart.items.forEach(item => {
                const itemPrice = item.productId.productDiscountedPrice
                    ? item.productId.productDiscountedPrice * item.quantity
                    : item.productId.categoryDiscountedPrice
                        ? item.productId.categoryDiscountedPrice * item.quantity
                        : item.productId.price * item.quantity;
            
                totalPrice += itemPrice - (discountAmount || 0);
            });
            
            
        console.log(userId,"id....................")
        console.log(userCart,"cart............")
            res.render("user/placeorder" ,{userCart,selectedAddress,totalPrice,paymentMethod, discount})
        } catch (error) {
            console.error(error);
            res.status(500).json({error:'Internal server errror'})
        }
     },
     continueCheckOut: async (req, res) => {
        try {
            const userId = req.session.userId;
            const { selectedAddress, name, addressline, pincode, street, city, state, mobile, paymentMethod,saveToDB } = req.body;
            const discountAmount = req.session.discount 
            console.log(discountAmount,"fddddddddddddddddddddddddddd")
        
            let addressDetails = {};
            let totalPrice = 0; 
    
            if (selectedAddress) {
                addressDetails = await Address.findById(selectedAddress);
            } else {
                if (saveToDB) {
                addressDetails = {
                    name: name,
                    addressline: addressline,
                    pincode: pincode,
                    street: street,
                    city: city,
                    state: state,
                    mobile: mobile,
                };
    
                const user = await User.findById(userId);
    
            
                const newAddress = await Address.create(addressDetails);
    
                user.addresses.push(newAddress._id);
                await user.save();
            }
        }
            const userWallet = await Wallet.findOne({ userId });
            const userCart = await Cart.findOne({ userId }).populate('items.productId');
    
           
            userCart.items.forEach(item => {
                const itemPrice = item.productId.productDiscountedPrice
                    ? item.productId.productDiscountedPrice * item.quantity
                    : item.productId.categoryDiscountedPrice
                        ? item.productId.categoryDiscountedPrice * item.quantity
                        : item.productId.price * item.quantity;
            
                totalPrice += itemPrice - (discountAmount || 0);
            });
            
    
            if (paymentMethod === 'Wallet' && (!userWallet || userWallet.balance < totalPrice)) {
          
                req.flash('error', 'Insufficient balance in your wallet.');
                return res.redirect('/cart'); 
            }
    
            // if (paymentMethod === 'Wallet') {
            //     // Deduct the total purchase amount from the wallet balance
            //     userWallet.balance -= totalPrice;
            //     await userWallet.save();
            // }
    
            req.session.selectedAddress = addressDetails;
            req.session.paymentMethod = paymentMethod;
    
            res.redirect('/placeorder');
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    
    
     }
module.exports=cartController