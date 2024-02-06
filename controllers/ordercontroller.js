const Product = require('../models/product');
const Category = require('../models/category');
const { uploadSingle, uploadMultiple }  = require('../util/multer');
const User = require('../models/user');
const Order=require('../models/order')
const Cart=require("../models/cart")
const Address=require("../models/address")
const Wallet=require("../models/wallet")
const Razorpay = require('razorpay');

const Coupon= require('../models/coupon')
const fs = require('fs');
const easyinvoice = require('easyinvoice');




const orderController={
    
  createRazorpayOrder: async (req, res) => {
    try {
      const { amount, currency } = req.body;
  
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_SECRET_KEY,
      });
  
      const options = {
        amount: amount * 100,
        currency: currency,
      };
  
      razorpay.orders.create(options, function (err, order) {
        if (err) {
          console.error('Failed to create Razorpay order:', err);
          return res.status(500).json({ error: 'Failed to create Razorpay order' });
        }
  
        // Redirect the user to the Razorpay payment page
        return res.status(200).json({
          key_id: process.env.RAZORPAY_KEY_ID,
          amount: options.amount,
          currency: options.currency,
          order_id: order.id,
        });
      });
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
  

saveOrder: async (req, res) => {
  try {
    const { userId,selectedAddress } = req.session;
    const { order_id, payment_id, razorpay_signature } = req.body;

    const discountAmount = req.session.discount
    const userCart = await Cart.findOne({ userId }).populate('items.productId');
   

    if (!userCart) {
      return res.status(404).send('User cart not found');
    }

    let totalPrice = 0;
    userCart.items.forEach((item) => {
      totalPrice += item.productId.price * item.quantity -  (discountAmount ?? 0);
    });

   console.log("save...........")
   let addressDetails = {}; 

    if (selectedAddress && typeof selectedAddress === 'object') {
      addressDetails = selectedAddress;
  } else {
     
      addressDetails = await Address.findById(selectedAddress);
  }

    const newOrder = new Order({
      userId: userId,
      products: userCart.items.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
        quantity: item.quantity,
        price: item.productId.productDiscountedPrice ||item.productId.categoryDiscountedPrice || item.productId.price,
      })),
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
      paymentMethod: 'Online Payment', 
      paymentStatus: "Paid",
      discount: discountAmount,

     
    });

    for (const productToUpdate of newOrder.products) {
      const existingProduct = await Product.findById(productToUpdate.productId);

      if (existingProduct) {
        existingProduct.stock -= productToUpdate.quantity;
        await existingProduct.save();
      }
    }

    await newOrder.save();

    
    userCart.items = [];
    await userCart.save();

   
    delete req.session.selectedAddress;
    delete req.session.paymentMethod;

    res.redirect('/paymentsuccess');
  } catch (error) {
    console.error('Error handling Razorpay callback:', error);
    res.status(500).send('Internal server error');
  }
},

placeOrder: async (req, res) => {
  try {
      const { userId } = req.session;
      const { selectedAddress, paymentMethod } = req.session;
      const discountAmount = req.session.discount;
      const couponCode = req.session.couponCode;
      const userCart = await Cart.findOne({ userId }).populate('items.productId');
        console.log(discountAmount,"discount")
        let totalPrice = 0;

        userCart.items.forEach(item => {
            const itemPrice = item.productId.productDiscountedPrice
                ? item.productId.productDiscountedPrice * item.quantity
                : item.productId.categoryDiscountedPrice
                    ? item.productId.categoryDiscountedPrice * item.quantity
                    : item.productId.price * item.quantity;
        
            totalPrice += itemPrice - (discountAmount || 0);
        });
        
        
           console.log(totalPrice,"totalp......")
      let addressDetails = {};

      if (selectedAddress && typeof selectedAddress === 'object') {
          addressDetails = selectedAddress;
      } else {
          addressDetails = await Address.findById(selectedAddress);
      }

      const savedAddress = await Address.create({
          userId: userId,
          name: addressDetails.name,
          addressline: addressDetails.addressline,
          street: addressDetails.street,
          city: addressDetails.city,
          state: addressDetails.state,
          pincode: addressDetails.pincode,
          mobile: addressDetails.mobile,
      });

      const productsToUpdate = userCart.items.map((item) => ({
          productId: item.productId._id,
          quantity: item.quantity,
          price: item.productId.productDiscountedPrice ||item.productId.categoryDiscountedPrice || item.productId.price,
      }));

      if (paymentMethod === "Cash On Delivery") {
         

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
              paymentStatus: "Pending",
              discount: discountAmount,
          });

          for (const product of productsToUpdate) {
              const existingProduct = await Product.findById(product.productId);

              if (existingProduct) {
                  existingProduct.stock -= product.quantity;
                  await existingProduct.save();
              }
          }

          if (couponCode) {
           
            const coupon = await Coupon.findOne({ code: couponCode });

            if (coupon) {
                if (!coupon.users.includes(userId)) {
                    coupon.users.push(userId);
                    await coupon.save();
                }
            } else {
                console.error("Coupon not found");
            }
        }
          await newOrder.save();

          userCart.items = [];
          await userCart.save();

          delete req.session.selectedAddress;
          delete req.session.paymentMethod;

          res.render('user/paymentsuccess');
      } else if ( paymentMethod === "Wallet") {
 

          const userWallet = await Wallet.findOne({ userId });

          if (!userWallet || userWallet.balance < totalPrice) {
             
              req.flash('error', 'Insufficient balance in your wallet.');
              return res.redirect('/cart'); 
          }

          userWallet.balance -= totalPrice;
          const transaction = {
            transactionType: 'debit',
            amount: totalPrice,
            date: new Date(),
            
        };

    
        userWallet.transactions.push(transaction);
          await userWallet.save();

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
              paymentStatus: "Paid"
          });

          for (const product of productsToUpdate) {
              const existingProduct = await Product.findById(product.productId);

              if (existingProduct) {
                  existingProduct.stock -= product.quantity;
                  await existingProduct.save();
                  console.log(existingProduct.stock,"existing new stock")
              }
          }
                
          await newOrder.save();

          userCart.items = [];
          await userCart.save();

          delete req.session.selectedAddress;
          delete req.session.paymentMethod;

          res.render('user/paymentsuccess');
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
  }
},

 getSalesByTimeInterval : async (interval) => {
  const currentDate = new Date();
  let startDate;

  switch (interval) {
      case 'daily':
          startDate = new Date(currentDate);
          break;
      case 'weekly':
          startDate = new Date(currentDate - 7 * 24 * 60 * 60 * 1000);
          break;
      case 'monthly':
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          break;
      default:
          startDate = new Date(0);
          break;
  }

  const totalSales = await Order.aggregate([
      { $match: { status: 'Delivered', orderDate: { $gte: startDate, $lte: currentDate } } },
      { $group: { _id: null, totalAmount: { $sum: '$totalPrice' } } }
  ]);

  return totalSales.length > 0 ? totalSales[0].totalAmount : 0;
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
      // cancelOrder :async (req, res) => {
      //   const { orderId } = req.params;
      //   console.log(orderId,"id.............")
      //   console.log(typeof(orderId))
      //   console.log("cancelled1111111...........")
      //   try {
         
      //     const canceledOrder = await Order.findByIdAndUpdate(orderId, { status: 'Cancelled' });

      // console.log(canceledOrder,"canceled order........")
      //     if (!canceledOrder) {
      //       return res.status(404).json({ message: 'Order not found' });
      //     }
      //     console.log("cancelled...........")
      //     res.status(200).json({ message: 'Order cancelled successfully' });
         
      //   } catch (err) {
      //     return res.status(500).json({ error: 'Internal server error' });
      //   }
      // },
      cancelOrder: async (req, res) => {
        const { orderId } = req.params;
    
        try {
            const canceledOrder = await Order.findById(orderId).populate('userId');
    
            if (!canceledOrder) {
                return res.status(404).json({ message: 'Order not found' });
            }
    
            for (const productToUpdate of canceledOrder.products) {
              const existingProduct = await Product.findById(productToUpdate.productId);
  
              if (existingProduct) {
                  existingProduct.stock += productToUpdate.quantity;
                  await existingProduct.save();
              }
          }


            if (canceledOrder.paymentMethod === 'Online Payment'|| 'Wallet') {
                let userWallet = await Wallet.findOne({ userId: canceledOrder.userId });
    
                if (!userWallet) {
                    userWallet = new Wallet({
                        userId: canceledOrder.userId,
                        balance: 0,
                    });
                    await userWallet.save();
                }
    
                userWallet.transactions.push({
                    transactionType: 'credit',
                    amount: canceledOrder.totalPrice,
                    date: new Date(),
                    orderId: canceledOrder._id,
                });
    
                userWallet.balance += canceledOrder.totalPrice;
                await userWallet.save();
            }
    
            canceledOrder.status = 'Cancelled';
            await canceledOrder.save();
    
            res.status(200).json({ message: 'Order cancelled successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    
    returnOrder: async (req, res) => {
        const { orderId } = req.params;
    
        try {
            const returnedOrder = await Order.findById(orderId).populate('userId');
    
            if (!returnedOrder) {
                return res.status(404).json({ message: 'Order not found' });
            }
    
           
            if (returnedOrder.status !== 'Delivered') {
                return res.status(400).json({ message: 'Invalid operation. Order status is not Delivered.' });
            }
    
            for (const productToUpdate of returnedOrder.products) {
              const existingProduct = await Product.findById(productToUpdate.productId);
  
              if (existingProduct) {
                  existingProduct.stock += productToUpdate.quantity;
                  await existingProduct.save();
              }
          }
            returnedOrder.status = 'Returned';
            await returnedOrder.save();
    
            
            const userWallet = await Wallet.findOne({ userId: returnedOrder.userId });
    
            if (!userWallet) {
                return res.status(404).json({ message: 'User wallet not found' });
            }
    
            const refundAmount = returnedOrder.totalPrice;
            userWallet.transactions.push({
                transactionType: 'credit',
                amount: refundAmount,
                date: new Date(),
                orderId: returnedOrder._id,
            });
    
            userWallet.balance += refundAmount;
            await userWallet.save();
    
            res.status(200).json({ message: 'Product returned successfully and amount refunded to the wallet' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
                                                                                                         
    
      
    adminOrderPage: async (req, res) => {
      const page = parseInt(req.query.page) || 1;
      const pageSize = 10; // Adjust this according to your needs
  
      try {
          const totalCount = await Order.countDocuments();
          const totalPages = Math.ceil(totalCount / pageSize);
  
          const orders = await Order.find()
              .populate('products.productId')
              .populate('userId')
              .sort({ orderDate: -1 })
              .skip((page - 1) * pageSize)
              .limit(pageSize);
  
          res.render("admin/order", {
              orders,
              currentPage: page,
              totalPages
          });
      } catch (error) {
          console.log(error);
          res.status(500).json({ error: "Internal server error" });
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
      updateOrderStatus: async (req, res) => {
        const orderId = req.params.orderId;
        const newStatus = req.body.orderStatus;
    
        try {
            let newPaymentStatus;
    
            // Check the order status
            if (newStatus === 'Delivered') {
                newPaymentStatus = 'Paid';
            } else if (newStatus === 'Returned') {
                newPaymentStatus = 'Refunded';
            } else if (newStatus === 'Cancelled') {
                
                const order = await Order.findById(orderId);
                const paymentMethod = order.paymentMethod;
    
             
                if (paymentMethod === 'Cash On Delivery') {
                    newPaymentStatus = 'Cancelled';
                } else if (paymentMethod === 'Wallet' || paymentMethod === 'Online Payment') {
                    newPaymentStatus = 'Refunded';
                }
            }
    
            const order = await Order.findByIdAndUpdate(
                orderId,
                { status: newStatus, paymentStatus: newPaymentStatus },
                { new: true }
            );
    
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }
    
            res.redirect('/admin/order');
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    adminAwaitingOrderPage: async (req, res) => {
      const page = parseInt(req.query.page) || 1;
      const pageSize = 10; 
  
      try {
          const totalCount = await Order.countDocuments();
          const totalPages = Math.ceil(totalCount / pageSize);
  
          const orders = await Order.find({status:"Pending"})
              .populate('products.productId')
              .populate('userId')
              .sort({ orderDate: -1 })
              .skip((page - 1) * pageSize)
              .limit(pageSize);
  
          res.render("admin/awaitingorders", {
              orders,
              currentPage: page,
              totalPages
          });
      } catch (error) {
          console.log(error);
          res.status(500).json({ error: "Internal server error" });
      }
  },
  //invoice 
     invoiceGenerator: async (req, res) => {
       try {
        const orderId = req.params.orderId;
        console.log(orderId,"id")

        const order = await Order.findById(orderId).populate('products.productId');

       console.log(order,"order...........")
        const invoiceData = {
            documentTitle: `Invoice-${orderId}`,
            currency: 'INR',
            taxNotation: 'GST',
            marginTop: 25,
            marginRight: 25,
            marginLeft: 25,
            marginBottom: 25,
            logo: '', 
            sender: {
                company: 'Impress',
                address: 'Your Company Address',
                zip: 'Your ZIP',
                city: 'Your City',
                country: 'Your Country',
            },
            client: {
                company: order.shippingAddress.name,
                address: order.shippingAddress.addressline,
                zip: order.shippingAddress.pincode,
                city: order.shippingAddress.city,
                country: order.shippingAddress.state,
            },
            invoiceNumber: `INV-${orderId}`,
            invoiceDate: order.orderDate.toISOString().split('T')[0],
            products: order.products.map(product => ({
                quantity: product.quantity,
                description: product.productId.name,
                tax: 18, 
                price: product.productId.price,
            })),
        };
        console.log('Invoice Data:', invoiceData);
        
        const pdfBuffer = await easyinvoice.createInvoice(invoiceData);
        // console.log('PDF Content:', pdfBuffer);

        // Stream the PDF to the response
        res.setHeader('Content-Disposition', `attachment; filename=invoice_${orderId}.pdf`);
     

        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating or downloading invoice:', error);
        res.status(500).send('Internal Server Error');
    }
},

    
}


module.exports=orderController