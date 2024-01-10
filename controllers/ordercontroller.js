const Product = require('../models/product');
const Category = require('../models/category');
const { uploadSingle, uploadMultiple }  = require('../util/multer');
const User = require('../models/user');
const Order=require('../models/order')
const Cart=require("../models/cart")
const Address=require("../models/address")
const Razorpay = require('razorpay');


const orderController={
    
  placeOrder: async (req, res) => {
    try {
        const { userId } = req.session;
        const { selectedAddress, paymentMethod } = req.session;

      
        const userCart = await Cart.findOne({ userId }).populate('items.productId');

        let totalPrice = 0;
        userCart.items.forEach((item) => {
            totalPrice += item.productId.price * item.quantity;
        });

        let addressDetails = {};

        if (selectedAddress && typeof selectedAddress === 'object') {
            addressDetails = selectedAddress;
        } else {
           
            addressDetails = await Address.findById(selectedAddress);
        }

        const productsToUpdate = userCart.items.map((item) => ({
            productId: item.productId._id,
            quantity: item.quantity,
        }));
      if(paymentMethod ==="Cash On Delivery"){
        const newOrder = new Order({
            userId: userId,
            products: productsToUpdate,
            totalPrice: totalPrice,
            shippingAddress: {
                name: addressDetails.name,
                addressline: addressDetails.addressline,
                street: addressDetails.street,
                city: addressDetails.city,
                state: addressDetails.state,
                pincode: addressDetails.pincode,
                mobile: addressDetails.mobile,
            },
            paymentMethod: paymentMethod,
        });

        for (const product of productsToUpdate) {
            const existingProduct = await Product.findById(product.productId);

            if (existingProduct) {
                existingProduct.stock -= product.quantity;
                await existingProduct.save();
            }
        }

        await newOrder.save();

        userCart.items = [];
        await userCart.save();

        delete req.session.selectedAddress;
        delete req.session.paymentMethod;

        res.render('user/paymentsuccess');
      }else if(paymentMethod ==="Online Payment"){
        const newOrder = new Order({
          userId: userId,
          products: productsToUpdate,
          totalPrice: totalPrice,
          shippingAddress: {
              name: addressDetails.name,
              addressline: addressDetails.addressline,
              street: addressDetails.street,
              city: addressDetails.city,
              state: addressDetails.state,
              pincode: addressDetails.pincode,
              mobile: addressDetails.mobile,
          },
          paymentMethod: paymentMethod,
      });
      req.session.newOrder = newOrder;
      res.render('user/paymentpage');
      }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
},


    showOrdersPage:async(req,res)=>{

        const {userId}=req.session
        console.log(userId,"userid.........")
         try {
          const order = await Order.find({ userId}).populate('products.productId').sort({ orderDate: -1 });
          // console.log(order,'..order')
          res.render("user/orders",{order})
        } catch (error) {
          console.log(error)
          res.status(500).json({ error: "Internal server error" })
        }
          
      },
      showOrderDetailsPage: async (req, res) => {
        const { userId } = req.session;
        const { orderId, productId } = req.params;
      
        try {
          const order = await Order.findOne({ _id: orderId, userId }).populate('products.productId');
          console.log(order.totalPrice);
      
        
          if (order) {
            res.render("user/orderdetails", { order });
          } else {
            res.status(404).json({ error: "Order not found" });
          }
        } catch (error) {
          console.log(error);
          res.status(500).json({ error: "Internal server error" });
        }
      },
      cancelOrder :async (req, res) => {
        const { orderId } = req.params;
        console.log(orderId,"id.............")
        console.log(typeof(orderId))
        console.log("cancelled1111111...........")
        try {
         
          const canceledOrder = await Order.findByIdAndUpdate(orderId, { status: 'Cancelled' });

      console.log(canceledOrder,"canceled order........")
          if (!canceledOrder) {
            return res.status(404).json({ message: 'Order not found' });
          }
          console.log("cancelled...........")
          res.status(200).json({ message: 'Order cancelled successfully' });
         
        } catch (err) {
          return res.status(500).json({ error: 'Internal server error' });
        }
      },
      
      
    adminOrderPage:async(req,res)=>{
      try {
        const order=await Order.find().populate('products.productId').populate('userId');;
        console.log(order,'..order')
        res.render("admin/order",{order})
      } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal server error" })
      }
         },
         adminOrderViewPage: async (req, res) => {
          const orderId = req.params.orderId;
      
          try {
              
              const order = await Order.findById(orderId).populate('userId').populate('products.productId');
      
              if (!order) {
                  return res.status(404).json({ error: "Order not found" });
              }
      
              res.render("admin/orderView", { order }); 
          } catch (error) {
              console.log(error);
              res.status(500).json({ error: "Internal server error" });
          }
      },
      updateOrderStatus:async(req,res)=>{
    const orderId = req.params.orderId;
    const newStatus = req.body.orderStatus; 
    const newPaymentStatus =req.body.paymentStatus
     console.log(orderId)
    try {
 
        const order = await Order.findByIdAndUpdate(orderId, { status: newStatus, paymentStatus: newPaymentStatus }, { new: true });

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        // if (order.paymentMethod === 'Cash On Delivery') {
        //     await Order.findByIdAndUpdate(orderId, { paymentStatus: 'Pending' });
        // }

        res.redirect('/admin/order'); 
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
}
}


module.exports=orderController