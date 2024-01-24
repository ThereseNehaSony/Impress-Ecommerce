const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require("../models/user");
const Product = require('../models/product');

const Address=require('../models/address')

 

const userController = require('../controllers/usercontroller');
// const adminController = require("../controllers/admincontroller");
const cartController = require("../controllers/cartcontroller");
const orderController=require("../controllers/ordercontroller")
const wishlistController=require("../controllers/wishlistcontroller")
const couponController= require('../controllers/couponcontroller')

const userAuth= require('../middleware/userAuth');
const adminAuth=require('../middleware/adminAuth');












// router.get('/home', userController.showUserHomePage);
router.get('/', userController.showIndexPage);
router.get('/productlist', userController.getProductList);
router.get('/contactus', userController.showContactPage);

//login
router.get('/login',userAuth.isLoggedIn,adminAuth.isLoggedIn, userController.showLoginPage);
router.post('/login', userController.loginUser);

//forgetpassword
router.get('/forgetpass',userAuth.isLoggedIn,userController.forgetPassword)
router.post('/request-otp',userController.requestOtp)
router.get('/requestotp',userAuth.isLoggedIn,userController.showRequestOtpPage)
router.post('/resetpassword',userController.verifyOtpp)
router.get('/resetpassword',userAuth.isLoggedIn,userController.showRPasswordResetPage)
router.post('/newpassword',userController.resetPassword)

//signup
router.get('/signup',userAuth.isLoggedIn,adminAuth.isLoggedIn,userController.showSignupForm);
router.post('/signup', userController.signup);
router.get('/otp',userController.showOtpPage)


router.post('/home', userController.verifyOtp);
// router.post('/resendOTP', userController.resendOtp);

//footer
router.get('/aboutus',userController.getAboutusPage)
router.get('/retunandrefund',userController.getReturnAndRefundPage)
router.get('/privacypolicy',userController.getPrivacyPolicyPage)
router.get('/terms',userController.getTermsPage)
router.get('/washcare',userController.getWashCarePage)

// router.get('/sendotp', userController.otpsender);

//userprofile
router.get("/profile",userAuth.userAuth, userController.showProfilePage)
router.post('/updateProfile', userController.updateUserProfile);

//address
router.get('/useraddress',userController.showAddressPage)
router.post('/addaddress',userController.addAddress)
router.delete('/removeAddress/:id',userController.deleteAddress)
router.get('/address/:id', userController.getAddress)
router.post('/editaddress/:id', userController.updateAddress);

router.get("/changepassword",userController.showChangePasswordPage)
router.get("/wallet",userController.getwalletpage)

//order
router.get("/orders",userAuth.userAuth, orderController.showOrdersPage)
router.get('/orderdetails/:orderId',orderController.showOrderDetailsPage)
router.post('/cancelorder/:orderId',orderController.cancelOrder)

router.post('/returnorder/:orderId', orderController.returnOrder);


router.get("/returns",userController.showReturnsPage)
router.get("/cancellations",userController.showCancellationsPage)





router.get('/products/:category', userController.renderProductsByCategory);
router.get('/products/view/:productId', userController.viewProduct);

//cart
router.get("/cart" ,userAuth.userAuth,cartController.showCartPage)

router.post('/addtocart/:productId', cartController.addToCart);
router.delete('/removeFromCart', cartController.removeFromCart);
router.put('/updateCartItemQuantity/:productId', cartController.updateCartItemQuantity);


//wishlist

router.get("/wishlist",wishlistController.showWishListPage)

router.post('/addtowishlist/:productId',  wishlistController.addToWishList);
router.post('/wishlist/addtocart/:productId', wishlistController.addtocart);
router.post('/wishlist/remove/:productId', wishlistController.removeFromWishList);

//coupon
router.get('/coupons', userController.getCouponPage)
router.get('/validate-coupon', couponController.validateCoupon);


//checkout
router.get("/checkout",cartController.getCheckOutPage)

router.get("/placeorder",cartController.getPlaceOrderPage)
router.post("/placeorder",cartController.continueCheckOut)

router.get("/paymentsuccess",cartController.getPaymentSuccessPage)


router.post('/confirmorder', orderController.placeOrder);



router.post('/createRazorpayOrder', orderController.createRazorpayOrder);
router.post('/razorpay/callback', orderController.saveOrder);
router.get('/razorpay/callback', orderController.saveOrder);

router.get('/search-results', (req, res) => {
  res.render('user/search-results'); 
});


router.get('/search', userController.searchResult);



 router.post('/filterAndSort', userController.filterAndSort);
  

module.exports = router;
