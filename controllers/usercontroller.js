const User = require('../models/user');
const Product = require('../models/product');
const Category=require('../models/category')
const Otp = require('../models/otp');
const Cart = require('../models/cart');
const Address=require('../models/address')

const bcrypt = require('bcryptjs');
// const { sendOTP, verifyOTP } = require('./otpController');
const sendEmail = require('../services/nodemailer');

const userController = {

  // showUserHomePage: async (req, res) => {
  //   try {
  //     const categories = await Category.find({ isBlocked: false });
  //     const impressKidsCategory = await Category.findOne({ name: 'impresskids' });
  //     const newArrivalsCategory = await Category.findOne({ name: 'newarrivals' });
  
  //     const impressKidsProducts = await Product.find({ category: impressKidsCategory._id });
  //     const newarrivals = await Product.find({ category: newArrivalsCategory._id });
  
  //     res.render('user/userhome', { categories, impressKidsProducts, newarrivals });
  //   } catch (err) {
  //     console.error(err);
  //     res.status(500).send('Server Error');
  //   }
  // },
  
  showOtpPage:(req,res)=>{
    if(req.session.user){
      res.redirect('/')
    }
     if(req.session.signed){
      res.render('user/otp')
     }else{
      res.redirect('/')
     }
  },
    showIndexPage: async (req, res) => {
      try {
        const categories = await Category.find({ isBlocked: false });
        const newarrivals = await Product.find({ isNewArrival: true, isBlocked: false });
        const impressKidsCategory = await Category.findOne({ name: 'impresskids'  });
        // const newArrivalsCategory = await Category.findOne({ name: 'newarrivals' });
    
        const impressKidsProducts = await Product.find({ category: impressKidsCategory._id , isBlocked: false  });
        // const newarrivals = await Product.find({ category: newArrivalsCategory._id , isBlocked: false  });
        
        res.render('user/index', { categories, impressKidsProducts ,newarrivals});
      } catch (err) {
        console.error(err);
       
        res.status(500).send('Server Error');
      }
    },
 //footer section-------------------------------------------------------------

    showContactPage: (req, res) => {
        res.render('user/contactus');
      },               
    getAboutusPage:(req,res)=>{
        res.render('user/aboutus')
      },
    getReturnAndRefundPage:(req,res)=>{
        res.render('user/returnandrefund')
      },
    getPrivacyPolicyPage:(req,res)=>{
        res.render('user/privacypolicy')
      },
    getTermsPage:(req,res)=>{
        res.render('user/terms')
    },
    getWashCarePage:(req,res)=>{
        res.render('user/washcare')
    },
    //login process----------------------------------------------------------

    showLoginPage: (req, res) => {
    //    if (req.session.user) {
    //    return res.redirect('/home');
    //  }
    //  if (req.session.adminLoggedIn) {
    //   res.redirect('/admin/admindash'); 
    // } 
      const error = '' 
     res.render('user/login', { error });
    },

    loginUser: async (req, res) => {
     try {
     const { email, password } = req.body;
     const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).render('user/login', { error: 'Invalid email or password' });
    }

    if (user.isBlocked) {
      return res.status(401).render('user/login', { error: 'Your account is blocked' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).render('user/login', { error: 'Invalid email or password' });
    }


    req.session.user = user;
    req.session.userId = user._id;
    req.session.email=email
    res.redirect('/'); 
    console.log(req.session)
     } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
    }
   },
 
    // Signup process----------------------------------------------------
    showSignupForm: (req, res) => {
      // if (req.session.user) {
      //   return res.redirect('/');
      // }
      // if (req.session.adminLoggedIn) {
      //   res.redirect('/admin/admindash'); 
      // } 
    res.render('user/signup');
    },

   signup: async (req, res) => {
  
    

    try {
    const { name, email, password, confirmPassword } = req.body;

    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(404).render('user/signup', { err: 'User already exists' });
    }
    req.session.signupDetails = { name, email, password };

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Create OTP record
    const otpRecord = new Otp({ otp, email });
    await otpRecord.save();

    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: 'Verify your email using OTP',
      html: `<p>Hai User,
      Your one-time password (OTP) for logging into our Impress website is: <strong>${otp}</strong></p>`
    };
    console.log("otp is..............", otp)
   
    await sendEmail(mailOptions);
    req.session.email = email;
    req.session.signed=email
    req.session.otpExpiry = Date.now() + 1 * 60 * 1000; 

    res.redirect('/otp'); 
  } catch (error) {
    console.log(error);
    res.send('Error occurred');
  }
 },


 verifyOtp: async (req, res) => {
  try {
    console.log('Verifying OTP...');

    const { otp1, otp2, otp3, otp4 } = req.body;
    const enteredOTP = otp1 + otp2 + otp3 + otp4;
    const { name, email, password } = req.session.signupDetails; 
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Entered OTP:', enteredOTP);

    const otpRecord = await Otp.findOne({ email, otp: enteredOTP });

    if (!otpRecord) {
      console.log('Invalid OTP. Rendering user/otp...');
      return res.render('user/otp', { err: 'Invalid OTP' });
    }

if (req.session.otpExpiry && Date.now() > req.session.otpExpiry) {
      console.log('OTP has expired. Please resend a new OTP.');
      return res.redirect('/otp', { err: 'OTP has expired. Please request a new one.' });
    }
    console.log('OTP record found. Updating user verification status...');
    const hashedPassword = await bcrypt.hash(password, 10); 
    req.session.user=email;
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      verified: true 
    });
    await newUser.save();
    const savedUser = await newUser.save();
    
    req.session.user = savedUser;
    req.session.userId = savedUser._id;
    // req.session.email=email

    // req.session.userId = savedUser._id;

    console.log('User saved. Deleting OTP record...');
    await Otp.deleteOne({ email, otp: enteredOTP });

    console.log('OTP record deleted. OTP verification complete. Rendering user/index...');
    return res.redirect('/');
  } catch (err) {
    console.error('Error in OTP verification:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
},


  // touserdash :async (req, res) => {
  //   try {
     
  //     const email = req.session.email;
  //     const enteredOTP = req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4;
  
  //     if (!email || !enteredOTP) {
  //       throw new Error('Email or OTP not found in session or request body');
  //     }
  
  //     const isOTPVerified = await verifyOTP(email, enteredOTP);
  
  //     if (isOTPVerified) {
        
  //       return res.render('user/index');
  //     } else {

  //       return res.render('user/otp', { error: 'Invalid OTP. Please try again.' });
  //     }
    
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).send('Internal Server Error');
  //   }
  // },

 
    
  getProductList: async (req, res) => {
    try {
      const products = await Product.find();
      res.render('user/productlist', { products });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).send('Error fetching products');
    }
  },
  
      
  renderProductsByCategory: async (req, res) => {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = 9;
  
    try {
      // Fetch the ObjectId of the category from the Category collection
      const foundCategory = await Category.findOne({ name: category });
      if (!foundCategory) {
        // Handle the case when the category is not found
        return res.status(404).send('Category not found');
      }
  
      const categoryId = foundCategory._id; // Get the ObjectId of the category
  
      const totalCount = await Product.countDocuments({ category: categoryId, isBlocked: false });
      const totalPages = Math.ceil(totalCount / itemsPerPage);
  
      const skip = (page - 1) * itemsPerPage;
      const products = await Product.find({ category: categoryId, isBlocked: false })
        .populate('category')
        .skip(skip)
        .limit(itemsPerPage);
  
      res.render('user/productlist', { category, products, totalPages, currentPage: page });
    } catch (err) {
      console.error('Error fetching products:', err);
      res.status(500).send('Error fetching products');
    }
  },
    
      redirectToProductviewPage:(req, res) => {
        res.render('user/productview'); 
      },

      viewProduct: async (req, res) => {
        const productId = req.params.productId;
        try {
          const product = await Product.findById(productId);
          console.log('Product images:', product.images);
          if (!product) {
            return res.status(404).send('Product not found');
          }
          req.session.productId = productId;
          res.render('user/productview', { product });
        } catch (err) {
          res.status(500).send('Error fetching product');
        }
      },
    //reset password---------------------------------------------------------------

      forgetPassword: (req, res) => {
        const error=''
      res.render('user/forgetpass',{error});
      },

      showRequestOtpPage:async(req,res)=>{
        const error=''
        res.render('user/requestotp',{error})
      },

      showRPasswordResetPage:async(req,res)=>{
        res.render('user/resetpassword')
      },
       
      requestOtp:async(req,res)=>{
        try {
          const { email}=req.body
          const user=await User.findOne({email})
          if(!user){
          res.render('user/forgetpass',{ error: 'User not found' })
          }
          const otp = Math.floor(1000 + Math.random() * 9000).toString();

          // Create OTP record
          const otpRecord = new Otp({ otp, email });
          await otpRecord.save();
      
          const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: 'Verify your email using OTP',
            html: `<p>Hai User,
            Your one-time password (OTP) for changing your password is: <strong>${otp}</strong></p>`
          };
          console.log("otp is............", otp)
         
          await sendEmail(mailOptions);
         
          req.session.email = email;
          return res.status(200).render('user/requestotp', { email}); 

        } catch (error) {
          
        }
      },
      verifyOtpp: async (req, res) => {
       try {
         console.log('Verifying OTP...');
     
         const { otp1, otp2, otp3, otp4 } = req.body;
         const enteredOTP = otp1 + otp2 + otp3 + otp4;
         const  email = req.session.email; 
        
         console.log('Email:', email);
         console.log('Entered OTP:', enteredOTP);
     
         const otpRecord = await Otp.findOne({ email, otp: enteredOTP });
     
         if (!otpRecord) {
           console.log('Invalid OTP. Rendering user/otp...');
           return res.render('user/requestotp', { error: 'Invalid OTP' });
         }
     
     
         console.log('User saved. Deleting OTP record...');
         await Otp.deleteOne({ email, otp: enteredOTP });
     
         console.log('OTP record deleted. OTP verification complete. ...');
         return res.render('user/resetpassword',{email});
       } catch (err) {
         console.error('Error in OTP verification:', err);
         res.status(500).json({ error: 'Internal Server Error' });
       }
     },
     resetPassword: async(req,res)=>{
      try {
        const email=req.session.email ;
        const{newPassword, confirmPassword}=req.body

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const user = await User.findOneAndUpdate({ email },{ $set: { password: hashedPassword } },{ new: true });
      
        // if (newPassword !== confirmPassword) {
        //   return res.render('user/resetpassword', { error: 'Passwords do not match' });
        // }
       const error=''
        // user.password = newPassword;
        // await user.save();
        console.log('password changed successfully.....')
        return res.render('user/login',{error})

      } catch (error) {
        
      }
     },
     //profile--------------------------------------------------
     showProfilePage: async (req,res)=>{
      try {
        
        const userEmail = req.session.email; 
    
       
        const user = await User.findOne({ email: userEmail }); 
    
        if (user) {
        
          res.render('user/userprofile', { user });
          req.session.email=userEmail;
        } else {
          
          res.status(404).send('User not found');
        }
      } catch (err) {
       
        console.error('Error fetching user details:', err);
        res.status(500).send('Internal Server Error');
      }
    },
//update profile info
updateUserProfile: async (req, res) => {
  const {  lastName, phoneNumber } = req.body;
  const email=req.session.email
console.log(req.body)
console.log(email)
  try {
    console.log("entered.......")
    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      { $set: { lastName: lastName, phoneNumber: phoneNumber } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log(updatedUser);
    return res.status(200).json({ message: 'User details updated successfully', user: updatedUser });
    
  } catch (error) {
    return res.status(500).json({ message: 'Error updating user details', error: error.message });
  }
},


    showAddressPage:(req,res)=>{
      res.render("user/address")
    },
    showChangePasswordPage:(req,res)=>{
      res.render("user/changepass")
    },

    //address
    showAddressPage:async (req,res)=>{
      const email = req.session.email; 
      const user = await User.findOne({ email: email }).populate('addresses');
      res.render("user/addressbook", { addresses: user.addresses })
    },
    addAddress:async(req,res)=>{
      try {
      
        
        const { name, addressline, pincode, street, city, state, mobile } = req.body;

 
        const newAddress = new Address({
            name,
            addressline,
            pincode,
            street,
            city,
            state,
            mobile
        });

        await newAddress.save();

        const userEmail = req.session.email; 
    const user = await User.findOne({ email: userEmail });

    if (user) {

      user.addresses.push(newAddress._id);
      await user.save();
        
      res.status(200).json({ message: 'Address added successfully' });
     } else {
          
          return res.status(404).json({ error: 'User not found' });
     }
    } catch (err) {
      
        console.error(err);
        res.status(500).json({ error: 'Failed to add address' });
    }
},
deleteAddress:async(req,res)=>{
 
    const addressId = req.params.id;

    try {
       
        const deletedAddress = await Address.findByIdAndDelete(addressId);

        if (!deletedAddress) {
            return res.status(404).json({ message: 'Address not found' });
        }

        return res.status(200).json({ message: 'Address removed successfully' });
    } catch (error) {
        console.error('Error removing address:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
},
 




    
    showReturnsPage:(req,res)=>{
      res.render("user/returns")
    },
    showCancellationsPage:(req,res)=>{
      res.render("user/cancellations")
    },
    

   
    
    
    //wishlist-----------------------------------------------
    showWishlist:(req,res)=>{
      res.render('user/wishlist')
    }
  }





module.exports = userController;
