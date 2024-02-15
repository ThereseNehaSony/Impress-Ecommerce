const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');

const userController = require('../controllers/usercontroller');

const cartController = require("../controllers/cartcontroller");
const orderController=require("../controllers/ordercontroller")
const wishlistController=require("../controllers/wishlistcontroller")
const couponController= require('../controllers/couponcontroller');


const userAuth= require('../middleware/userAuth');
const adminAuth=require('../middleware/adminAuth');
const adminController = require("../controllers/admincontroller");












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
router.get('/resend-otp', userController.resendOTP)


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




router.get('/returns', userAuth.userAuth,userController.getReturnPage)
router.get('/cancellations',userAuth.userAuth, userController.getCancelledPage)

//address
router.get('/address',userAuth.userAuth, userController.showAddressPage1)
router.get('/useraddress',userAuth.userAuth,userController.showAddressPage)
router.post('/addaddress',userController.addAddress)
router.delete('/removeAddress/:addressId',userController.deleteAddress)
router.get('/getaddress/:addressId',userAuth.userAuth, userController.getAddress)
router.put('/updateaddress/:addressId', userController.updateAddress);

router.get("/changepassword",userAuth.userAuth,userController.showChangePasswordPage)
router.post('/changepassword', userController.changePassword)
router.get("/wallet",userAuth.userAuth,userController.getwalletpage)

//order
router.get("/orders",userAuth.userAuth, orderController.showOrdersPage)
router.get('/orderdetails/:orderId',userAuth.userAuth,orderController.showOrderDetailsPage)
router.post('/cancelorder/:orderId',orderController.cancelOrder)

router.post('/returnorder/:orderId', orderController.returnOrder);


router.get("/returns",userAuth.userAuth,userController.showReturnsPage)
router.get("/cancellations",userAuth.userAuth,userController.showCancellationsPage)





router.get('/products/:category', userController.renderProductsByCategory);
router.get('/products/view/:productId', userController.viewProduct);
router.get('/productnotfound',userController.productNotFound)

//cart
router.get("/cart" ,userAuth.userAuth,cartController.showCartPage)

router.post('/addtocart/:productId',  cartController.addToCart);
router.delete('/removeFromCart', cartController.removeFromCart);
router.post('/updateQuantity', cartController.updateCartItemQuantity);


//wishlist

router.get("/wishlist",userAuth.userAuth,wishlistController.showWishListPage)

router.post('/addtowishlist/:productId',  wishlistController.addToWishList);
router.post('/wishlist/addtocart/:productId', wishlistController.addtocart);
router.post('/wishlist/remove/:productId', wishlistController.removeFromWishList);

//coupon
router.get('/coupons',userAuth.userAuth, userController.getCouponPage)
router.post('/validate-coupon', couponController.validateCoupon);


//checkout
router.get("/checkout",userAuth.userAuth,cartController.getCheckOutPage)

router.get("/placeorder",userAuth.userAuth,cartController.getPlaceOrderPage)
router.post("/placeorder", cartController.continueCheckOut)

router.get("/paymentsuccess",userAuth.userAuth,cartController.getPaymentSuccessPage)


router.post('/confirmorder', orderController.placeOrder);


//razorpay
router.post('/createRazorpayOrder', orderController.createRazorpayOrder);
router.post('/razorpay/callback', orderController.saveOrder);
router.get('/razorpay/callback', orderController.saveOrder);

// router.get('/search-results', (req, res) => {
//   res.render('user/search-results'); 
// });

router.get('/order/:orderId/download-invoice', orderController.downloadInvoice);



router.get('/search', userController.searchResult);


router.post('/filterAndSort', userController.filterAndSort);

router.get('/messagesuccess', userController.getMessageSuccess)
router.post('/contact', userController.sendMessage);

//logout
router.get('/logout', userController.userLogout);


module.exports = router;
