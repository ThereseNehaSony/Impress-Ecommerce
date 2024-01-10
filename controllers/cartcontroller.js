const Cart = require('../models/cart');
const User = require('../models/user');
const Product = require('../models/product');
const Category = require('../models/category');
const Address= require("../models/address")

const cartController={
     //cart---------------------------------------------------
     showCartPage:async(req,res)=>{
        try {
          const { userId } = req.session; 
          
         
          const userCart = await Cart.findOne({ userId }).populate('items.productId');
          req.session.user=userId
          res.render('user/cart', { userCart }); 
      } catch (err) {
          console.error(err);
          res.status(500).json({ error: 'Internal server error' });
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
        console.log("entered cart");
        try {
            console.log("entered cart");
          const { userId } = req.session;
          const { productId, quantity } = req.body;
          console.log(req.body,"........reqbody")
      console.log(userId,".....userid");
      console.log(productId,".productid");
      console.log((quantity),"quanty");
         let userCart = await Cart.findOne({ userId });
      
          if (!userCart) {
            return res.status(404).json({ message: 'Cart not found' });
          }
      
          const updatedItems = userCart.items.map(item => {
            if (item.productId.toString() === productId) {
           
              item.quantity = quantity;
            }
            return item;
          });
      
          userCart.items = updatedItems;
          await userCart.save();
      
          req.flash('success', 'Cart updated successfully');
          res.status(200).json({ message: 'Cart updated successfully' });
        } catch (err) {
            console.log("not entered cart");
          console.error(err);
          res.status(500).json({ error: 'Internal server error' });
        }
      },
      getCheckOutPage:async(req,res)=>{
        try {
            const { userId } = req.session; 
            const email=req.session.email;   
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
           
            res.render('user/checkout', { userCart, addresses: user.addresses}); 
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
            const selectedAddress = await Address.findById(selectedAddressId);
            const userCart= await Cart.findOne({userId}).populate("items.productId")
        

        let totalPrice = 0;
        userCart.items.forEach(item => {
            totalPrice += item.productId.price * item.quantity;
        });
        console.log(userId,"id....................")
        console.log(userCart,"cart............")
            res.render("user/placeorder" ,{userCart,selectedAddress,totalPrice,paymentMethod})
        } catch (error) {
            console.error(error);
            res.status(500).json({error:'Internal server errror'})
        }
     },
     continueCheckOut: async (req, res) => {
        const { selectedAddress, name, addressline, pincode, street, city, state, mobile, paymentMethod } = req.body;
    
        let addressDetails = {};
    
        if (selectedAddress) {
            
            addressDetails = await Address.findById(selectedAddress);
        } else {
            
            addressDetails = {
                name: name,
                addressline: addressline,
                pincode: pincode,
                street: street,
                city: city,
                state: state,
                mobile: mobile,
            };
        }
    
        req.session.selectedAddress = addressDetails;
        req.session.paymentMethod = paymentMethod;
    
        res.redirect('/placeorder');
    },
      
     }
module.exports=cartController