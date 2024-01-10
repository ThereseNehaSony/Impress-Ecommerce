const adminCredentials = {
  email: 'admin@gmail.com',
  password: 'admin123'
};

const Product = require('../models/product');
const Category = require('../models/category');
const { uploadSingle, uploadMultiple }  = require('../util/multer');
const User = require('../models/user');


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

  adminDashboard: (req, res) => {
    res.render('admin/admindash', { title: 'Admin Home' });
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
      const users = await User.find({}); 
           
      
      res.render('admin/customers', { users });
    } catch (error) {
      console.error('Error displaying customer list:', error);
      res.status(500).send('Error displaying customer list');
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
}


};


 
  module.exports = adminController;
