const User = require('../models/user');
const Product = require('../models/product');
const Category = require('../models/category')
const Otp = require('../models/otp');
const Address = require('../models/address')
const Wallet = require('../models/wallet')
const Coupon = require('../models/coupon')
const Banner = require('../models/banner')
const bcrypt = require('bcryptjs');

const ProductOffer = require('../models/productoffer')
const CategoryOffer = require('../models/categoryoffer')

const sendEmail = require('../services/nodemailer');
const Order = require('../models/order');
const Message = require('../models/messages')

const userController = {

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
        const banners = await Banner.find().populate('category');
        const categoryOffer = await CategoryOffer.find();
        console.log(categoryOffer,"..........................")
       
    
        const impressKidsProducts = await Product.find({ category: impressKidsCategory?._id , isBlocked: false  });
        
        
        res.render('user/index', { categories, impressKidsProducts ,newarrivals, banners, categoryOffer});
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
     res.render('user/signup');
    },

    signup: async (req, res) => {
      try {
        const { name, email, password, confirmPassword } = req.body;
    
        const userExist = await User.findOne({ email });
        if (userExist) {
          return res.status(409).render('user/signup', { err: 'User already exists' });
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
    
        console.log("otp is..............", otp);
    
        await sendEmail(mailOptions);
    
        // Set session variables
        req.session.email = email;
        req.session.signed = email;
        req.session.otpExpiry = Date.now() + 1 * 60 * 1000; // OTP expiry in 1 minute
    
        res.redirect('/otp');
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    },
    
    resendOTP: async (req, res) => {
      try {
        const { email } = req.session.signupDetails;
    
        // Check if there is an existing OTP record
        let existingOTPRecord = await Otp.findOne({ email });
    
        if (existingOTPRecord) {
          // Generate a new OTP and reset the expiration time
          const newOTP = Math.floor(1000 + Math.random() * 9000).toString();
          existingOTPRecord.otp = newOTP;
          existingOTPRecord.creationTime = Date.now();
          await existingOTPRecord.save();
    
          const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: 'Resend OTP - Verify your email using OTP',
            html: `<p>Hai User,
              Your new one-time password (OTP) for logging into our Impress website is: <strong>${newOTP}</strong></p>`
          };
    
          console.log("New OTP is..............", newOTP);
    
          await sendEmail(mailOptions);
    
          req.session.otpExpiry = existingOTPRecord.creationTime + 1 * 60 * 1000; // Set OTP expiry time
        } else {
          // Generate a new OTP and create a new OTP record
          const newOTP = Math.floor(1000 + Math.random() * 9000).toString();
          const creationTime = Date.now();
    
          const newOTPRecord = new Otp({ otp: newOTP, email, creationTime });
          await newOTPRecord.save();
    
          const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: 'Resend OTP - Verify your email using OTP',
            html: `<p>Hai User,
              Your new one-time password (OTP) for logging into our Impress website is: <strong>${newOTP}</strong></p>`
          };
    
          console.log("New OTP is..............", newOTP);
    
          await sendEmail(mailOptions);
    
          req.session.otpExpiry = creationTime + 1 * 60 * 1000; 
        }
    
        res.redirect('/otp');
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
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
      return res.render('user/otp', { err: 'OTP has expired. Please request a new one.' });
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
   
    const newWallet = new Wallet({
      userId: savedUser._id,
      balance: 0, 
    });
    
    await newWallet.save();

    console.log('User saved. Deleting OTP record...');
    await Otp.deleteOne({ email, otp: enteredOTP });

    console.log('OTP record deleted. OTP verification complete. Rendering user/index...');
    return res.redirect('/');
  } catch (err) {
    console.error('Error in OTP verification:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
},




 
    
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
        const foundCategory = await Category.findOne({ name: category });

        if (!foundCategory) {
            return res.status(404).send('Category not found');
        }

        const categoryId = foundCategory._id;
        const totalCount = await Product.countDocuments({ category: categoryId, isBlocked: false });
        const totalPages = Math.ceil(totalCount / itemsPerPage);
        const skip = (page - 1) * itemsPerPage;

        let filterQuery = { category: categoryId, isBlocked: false };

        if (req.query.search) {
            filterQuery.name = { $regex: new RegExp(req.query.search, 'i') };
        }

        if (req.query.size) {
            const sizes = Array.isArray(req.query.size) ? req.query.size : [req.query.size];
            filterQuery.size = { $in: sizes };
            console.log(req.query.size)
        }

        if (req.query.productColor) {
            const filterColorArray = Array.isArray(req.query.productColor) ? req.query.productColor : [req.query.productColor];
            filterQuery.productColor = { $in: filterColorArray };
            console.log(req.query.productColor)
        }

        console.log('Filter Query:', filterQuery);

        let sortOption = {};

        if (req.query.sortOptions) {
            switch (req.query.sortOptions) {
                case 'priceAsc':
                    sortOption = { price: 1 };
                    break;
                case 'priceDesc':
                    sortOption = { price: -1 };
                    break;
            }
        }

        const currentDate = new Date();
        const products = await Product.find(filterQuery)
            .sort(sortOption)
            .populate('category')
            .skip(skip)
            .limit(itemsPerPage);

        for (const product of products) {
            
            const productOffer = await ProductOffer.findOne({
                product: product._id,
                startDate: { $lte: currentDate },
                endDate: { $gte: currentDate },
            });

          
            const categoryOffer = await CategoryOffer.findOne({
                category: categoryId,
                startDate: { $lte: currentDate },
                endDate: { $gte: currentDate },
            });

            if (productOffer && (!categoryOffer || productOffer.endDate > categoryOffer.endDate)) {
                const discountedPrice = product.price - (product.price * productOffer.discountPercentage) / 100;
                product.discountedPrice = discountedPrice;
            } else if (categoryOffer) {
                const discountedPrice = product.price - (product.price * categoryOffer.discountPercentage) / 100;
                product.discountedPrice = discountedPrice;
            }
        }

        res.render('user/productlist', { category, products, totalPages, currentPage: page });

    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).send('Error fetching products');
    }
},

    
      redirectToProductviewPage:(req, res) => {
        res.render('user/productview'); 
      },
      productNotFound:(req,res)=>{
        res.render('user/productnotfound')
      },
      viewProduct: async (req, res) => {
        const productId = req.params.productId;
      
        try {
          const product = await Product.findById(productId).populate('category');
      
          if (!product) {
            return res.status(404).send('Product not found');
          }
      
          
          if (product.category && product.category.isBlocked) {
            return res.render("user/productnotfound", { message: 'Category is currently not available' });
          }
      
          if (product.isBlocked) {
            return res.render("user/productnotfound", { message: 'Product is currently not available' });
          }
      
          const isLoggedIn = req.session && req.session.userId;
   
          req.session.productId = productId;
          res.render('user/productview', { product, isLoggedIn });
        } catch (err) {
          console.error(err);
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

          //  OTP record
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
      
       const error=''
      
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


    showAddressPage1:async(req,res)=>{
      const email = req.session.email; 
      const user = await User.findOne({ email: email }).populate('addresses');
      res.render("user/address", { addresses: user.addresses })
    },
    showChangePasswordPage:(req,res)=>{
      const {error} = req.query;
            res.render("user/changepass",{error})
    },
     changePassword: async (req, res) => {
      try {
        const email = req.session.email;
        const { Password, newPassword } = req.body;
    
      
        const user = await User.findOne({ email });
        if (!user) {
          
          return res.status(404).render('user/login', { error: 'User not found' });
        }
    
        const isPasswordMatch = await bcrypt.compare(Password, user.password);
        if (!isPasswordMatch) {
         
          return res.render('user/changepass', { error: 'Current password is incorrect' });
        }
    
        // Hash the new password and update the user's password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findOneAndUpdate({ email }, { $set: { password: hashedPassword } }, { new: true });
    
        console.log('Password changed successfully');
        return res.render('user/changepass', { error: 'Password changed successfully' });
    
      } catch (error) {
        // Handle other errors
        console.error(error);
        return res.status(500).render('user/login', { error: 'Internal server error' });
      }
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
updateAddress :async (req, res) => {
  const addressId = req.params.addressId;
  const updatedAddress = req.body; 
  console.log(addressId,"addd")
  try {
    
      const result = await Address.findByIdAndUpdate(addressId, updatedAddress, { new: true });
      console.log(result)
      if (!result) {
          return res.status(404).json({ error: 'Address not found' });
      }

      return res.status(200).json({ message: 'Address updated successfully', data: result });
  } catch (error) {
      console.error('Error updating address:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
  }
},
getAddress:async (req, res) => {
  const addressId = req.params.addressId;
  console.log(addressId,"id.............")
  try {
    
    const address = await Address.findById(addressId);
console.log(address,"addressss")
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json(address);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
},
deleteAddress:async(req,res)=>{
 
    const addressId = req.params.addressId;
console.log(addressId,"idddddddddddddd")
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
 
searchResult:async (req, res) => {
  const searchQuery = req.query.q; 

  try {
    const searchResults = await Product.find({
      $text: { $search: searchQuery }
    }).populate('category');

    console.log('search results....................................', searchResults);

    res.render('user/search-results', { searchResults });
  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
},

filterAndSort:async (req, res) => {
  const selectedSizes = req.body.selectedSizes;
  const selectedColors = req.body.selectedColors;
  const selectedSortOption = req.body.selectedSortOption;


  const filterQuery = {
      size: { $in: selectedSizes },
      color: { $in: selectedColors },
  };
console.log(filterQuery)
  
  const sortQuery = {};
  if (selectedSortOption === 'priceAsc') {
      sortQuery.price = 1;
  } else if (selectedSortOption === 'priceDesc') {
      sortQuery.price = -1;
  }
console.log(sortQuery)
  try {

      const result = await Product.find().sort(sortQuery).exec();
      console.log(result,"result")
      res.json(result);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
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
    },
    //wallet-------------------------------------------------
    getwalletpage: async (req, res) => {
      const userId = req.session.userId;
      const page = parseInt(req.query.page) || 1;
      const transactionsPerPage = 10;
  
      try {
          const wallet = await Wallet.findOne({ userId: userId });
  
          if (wallet) {
              wallet.transactions.sort((a, b) => b.date - a.date);
  
              const startIndex = (page - 1) * transactionsPerPage;
              const endIndex = startIndex + transactionsPerPage;
              const paginatedTransactions = wallet.transactions.slice(startIndex, endIndex);
  
              console.log(wallet, "wallet");
              res.render('user/wallet', {
                  wallet,
                  transactions: paginatedTransactions,
                  currentPage: page,
                  transactionsPerPage: transactionsPerPage, 
              });
          } else {
              console.log("Wallet not found for the user");
              res.status(404).send("Wallet not found");
          }
      } catch (error) {
        console.error("Error fetching wallet:", error);
       
        next(error);
      }
  },
  
  
  
    //coupon--------------------------------------------
     getCouponPage : async (req, res) => {
      try {
          const currentDate = new Date();
          const coupons = await Coupon.find({ startDate: { $lte: currentDate } });
  
          res.render("user/coupon", { coupon: coupons });
      } catch (error) {
          console.error("Error fetching coupons:", error);
          
          res.status(500).send("Internal Server Error");
      }
  },
 // return page
getReturnPage: async (req, res) => {
  const userId = req.session.userId;

  try {
    const orders = await Order.find({ status: "Returned", userId })
      .populate('products.productId')
      .sort({ orderDate: -1 });

    res.render('user/returns', { orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
},
getCancelledPage:async(req,res)=>{
  const userId = req.session.userId;

  try {
    const orders = await Order.find({ status: "Cancelled", userId })
      .populate('products.productId')
      .sort({ orderDate: -1 });

    res.render('user/cancellations', { orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
},
userLogout: (req, res) => {
 
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      res.status(500).json({ error: "Internal server error" });
    } else {
     
      res.redirect('/');
    }
  });
},
getMessageSuccess:(req,res)=>{
  res.render('user/messagesuccess')
},
sendMessage:async (req, res) => {
  const { txtName, txtEmail, txtPhone, txtMsg } = req.body;

  const message = new Message({
    name: txtName,
    email: txtEmail,
    phoneNumber: txtPhone,
    message: txtMsg,
  });

  try {
  
    await message.save();

    res.render('user/messagesuccess')
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
},

userLogout:(req,res)=>{
  req.session.destroy((err) => {
   
    if (err) {
      console.log(err);
      res.status(500).json({ error: "Internal server error" });
    } else {

      res.redirect('/');
    }
  });
},
  }





module.exports = userController;
