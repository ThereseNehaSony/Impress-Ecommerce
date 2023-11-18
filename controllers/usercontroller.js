const User = require('../models/user');
const bcrypt = require('bcryptjs');

const userController = {
    showHomePage: (req, res) => {
        res.render('user/index');
      },
    
    showContactPage: (req, res) => {
        res.render('user/contactus');
      },

    showLoginPage: (req, res) => {
        res.render('user/login');
      },

    showSignupForm: (req, res) => {
    res.render('user/signup');
    },

    showIndexPage: (req, res) => {
     
        res.render('user/index');
      },
    

    signupUser: async (req, res) => {
        const { fullname, email, password } = req.body;
    
        // Perform your custom validation here
        if (!fullname || !email || !password) {
          return res.render('user/signup', { error: 'All fields are required' });
        }
    
        try {
          const existingUser = await User.findOne({ email });
    
          if (existingUser) {
            return res.render('user/signup', { error: 'Email already exists' });
          }
    
          const hashedPassword = await bcrypt.hash(password, 10);
          const newUser = new User({ fullname, email, password: hashedPassword });
          await newUser.save();
    
          req.session.user = newUser; // Set session data
    
          // Redirect to the index page after successful signup
          res.redirect('/user/otp');
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      },
      showOtpPage: (req, res) => {
     
        res.render('user/otp');
      },
    }






module.exports = userController;
