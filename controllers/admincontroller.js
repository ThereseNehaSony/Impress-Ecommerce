const adminCredentials = {
  email: 'admin@gmail.com',
  password: 'admin123'
};

const Product = require('../models/product');
const Category = require('../models/category');
const { uploadSingle, uploadMultiple }  = require('../util/multer');
const User = require('../models/user');
const Coupon=require("../models/coupon")
const Order = require('../models/order')


const adminController = {
  adminLoginPage: (req, res) => {
    if (req.session.adminLoggedIn) {
      res.redirect('/admindash'); 
    } else {
    res.render('admin/adminlogin', { title: 'Admin Login', error: req.session.loginError || null });
    req.session.loginError = null; 
    }
  },

  adminLogin: (req, res) => {
    const { email, password } = req.body;

   

    if (email === adminCredentials.email && password === adminCredentials.password) {
      req.session.adminLoggedIn = true;
      req.session.loginError = null; 
      res.redirect('/admin/admindash');
    } else {
      req.session.loginError = 'Invalid credentials.';
      res.redirect('/admin');
    }
  },

  adminDashboard: async (req, res) => {
    try {

      const startDate = req.query.startDate;
      const endDate = req.query.endDate; 

        const pendingOrders = await Order.countDocuments({ status: 'Pending' });
        const processedOrders = await Order.countDocuments({ status: 'Processing' });
        const shippedOrders = await Order.countDocuments({ status: 'Shipped' });
        const cancelledOrders = await Order.countDocuments({ status: 'Cancelled' });
        const returnedOrders = await Order.countDocuments({ status: 'Returned' });
        const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });

        const allOrders = await Order.find();
        const outOfStock = await Product.countDocuments({ stock: "0" });
        const aboutToFinish = await Product.find({stock:{$lt:10}});
        const users = await User.countDocuments();


     

        const totalSalesByMonth = await Order.aggregate([
          {
              $match: {
                  paymentStatus: 'Paid',
                 
              },
          },
          {
              $group: {
                  _id: { $month: '$orderDate' },
                  totalAmount: { $sum: '$totalPrice' },
              },
          },
      ]);
      
     
      const monthlyRevenue = Array.from({ length: 12 }).fill(0);
      
      totalSalesByMonth.forEach((entry) => {
          monthlyRevenue[entry._id - 1] = entry.totalAmount;
      });
      
      
      
        res.render('admin/admindash', {
            title: 'Admin Home',
            pendingOrders,
            processedOrders,
            shippedOrders,
            cancelledOrders,
            returnedOrders,
            deliveredOrders,
            allOrders,
            outOfStock,
            users,
            monthlyRevenue,
         
            aboutToFinish,
          

        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
},

admindashSales:async(req,res)=>{
try {
  
  const startDate = req.query.startDate;
  const endDate = req.query.endDate; 
  
  const dateFilter = {};

  if (startDate && endDate) {
      dateFilter.orderDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
      };
  }

  const totalSalesByMonth = await Order.aggregate([
    {
        $match: {
            paymentStatus: 'Paid',
            ...dateFilter,
        },
    },
    {
        $group: {
            _id: { $month: '$orderDate' },
            totalAmount: { $sum: '$totalPrice' },
        },
    },
]);


res.json({
  monthlyRevenue: totalSalesByMonth.map(entry => entry.totalAmount),
 
});

} catch (error) {
  console.error('Error:', error);
  res.status(500).send('Internal Server Error');
}
},
  adminCustomersPage:(req,res)=>{
    res.render('admin/customers', { title: "Customers List" });
  },

  customerViewPage: (req, res) => {
    res.render('admin/customerView'); 
  },

  adminOrderPage:(req,res)=>{
    res.render('admin/order', { title: "Orders List" });
  },

  adminSalesPage:(req,res)=>{
    res.render('admin/sales', { title: "Sales Report" });
  },
 

  displayUserList: async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const ITEMS_PER_PAGE = 10;
        const users = await User.find({})
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);

        const totalUsers = await User.countDocuments();

        res.render('admin/customers', {
            users,
            current: page,
            pages: Math.ceil(totalUsers / ITEMS_PER_PAGE),
        });
    } catch (error) {
      
      next(error);
    }
},
 

toggleCustomerStatus: async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.redirect('/admin/customers');
  } catch (err) {
    res.status(500).send('Error toggling the customer status');
  }
},
getCouponPage: async (req,res) => {
  const coupon = await Coupon.find()
  res.render('admin/coupon',{coupon})
},
addCoupon: async (req, res) => {
  try {
      const { name,code, discountPercentage,startDate, expirationDate, maxUsage } = req.body;
      console.log('Received data:', req.body);

      // Check if a coupon with the same name already exists
      const existingCoupon = await Coupon.findOne({ name });

      if (existingCoupon) {
          // Handle the case where the coupon already exists
          return res.status(400).json({ message: 'Coupon with this name already exists.' });
      }

      const newCoupon = new Coupon({
          name,
          code,
          discountPercentage,
          startDate,
          expirationDate,
       
      });

      await newCoupon.save();

      res.status(201).json({ message: 'Coupon added successfully' });
  } catch (error) {
      console.error(error);

      
      if (error.name === 'MongoServerError' && error.code === 11000) {
          return res.status(400).json({ message: 'Coupon with this name already exists.' });
      }

      res.status(500).json({ message: 'Internal Server Error' });
  }
},


};


 
  module.exports = adminController;
