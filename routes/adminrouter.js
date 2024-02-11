const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admincontroller');
const categoryController=require('../controllers/categorycontroller')
const productController=require('../controllers/productcontroller')
const orderController=require('../controllers/ordercontroller')
const adminAuth = require('../middleware/adminAuth');
const couponController= require('../controllers/couponcontroller')
const bannerController = require('../controllers/bannerController');
const offerController = require('../controllers/offerController')

const reportController = require('../controllers/reportController')

// Import necessary modules and controllers

// Define route for generating sales report
router.get('/download-sales-report', reportController.generateSalesReport);

// Define route for downloading sales report
router.get('/download-sales-report/:fileName', reportController.downloadSalesReport);



router.get('/', adminAuth.isLoggedIn, adminController.adminLoginPage);
router.post('/login', adminController.adminLogin);
router.get('/admindash',adminAuth.adminAuth, adminController.adminDashboard);
router.get('/admindashsales',adminController.admindashSales)



// router.get('/product', adminController.adminProductPage);
// router.get('/editproduct', adminController.adminEditProductPage);



// add product
router.get('/product',adminAuth.adminAuth, productController.displayProductList);
router.get('/addproduct',adminAuth.adminAuth, productController.adminAddProductPage);
router.post('/addproduct',adminAuth.adminAuth, productController.addProduct);
router.post('/saveproduct',adminAuth.adminAuth, productController.adminSaveProduct);

//edit product
router.get('/editproduct/:id',adminAuth.adminAuth, productController.adminEditProductPage);
router.post('/updateproduct/:id',adminAuth.adminAuth, productController.adminUpdateProduct);
router.get('/toggleproductstatus/:productId',adminAuth.adminAuth, productController.toggleProductStatus);
//impresskids

// router.get('/impresskids',adminAuth1.adminAuth,adminController.adminImpressKidsPage)


//add category
router.get('/category', adminAuth.adminAuth,categoryController.displayCategoryList);
router.get('/addcategory',adminAuth.adminAuth, categoryController.adminAddCategoryPage);
router.post('/savecategory',adminAuth.adminAuth, categoryController.adminSaveCategory);
router.post('/addcategory',adminAuth.adminAuth, categoryController.addCategory);

//edit category
router.get('/editcategory/:id',adminAuth.adminAuth, categoryController.adminEditCategoryPage);
router.post('/updatecategory/:id',adminAuth.adminAuth, categoryController.adminUpdateCategory);
router.get('/togglecategorystatus/:categoryId',adminAuth.adminAuth,categoryController.toggleCategoryStatus);


// user
router.get('/customers',adminAuth.adminAuth, adminController.displayUserList);
router.get('/toggleuserstatus/:userId',adminAuth.adminAuth, adminController.toggleCustomerStatus);



//coupon
router.get('/coupon',adminAuth.adminAuth,couponController.getCouponPage)
router.post('/addcoupon',couponController.addCoupon)
router.get('/editcoupon/:id',adminAuth.adminAuth,couponController.editCoupon );

router.put('/edit-coupon/:id',couponController.postEditCoupon );

router.delete('/delete-coupon/:id',couponController.deleteCoupon);




//order
router.get('/order',adminAuth.adminAuth,orderController.adminOrderPage)
router.get('/orderview/:orderId',adminAuth.adminAuth,orderController.adminOrderViewPage)
router.post("/updateOrderStatus/:orderId",orderController.updateOrderStatus)



//banner
router.get('/banner',adminAuth.adminAuth,bannerController.getBannerPage)
router.post('/addbanner',  bannerController.addBanner);
router.delete('/deletebanner/:bannerId', bannerController.deleteBanner);



//sales
// router.get('/sales',adminController.adminSalesPage)

// router.get('/logout', adminController.adminLogout);

//offers

router.get('/productoffer',adminAuth.adminAuth, offerController.getProductOfferPage)
router.get('/categoryoffer',adminAuth.adminAuth,offerController.getCategoryOfferPage)
router.get('/categories',adminAuth.adminAuth, offerController.getCategory )
router.get('/products', adminAuth.adminAuth,offerController.getProduct )
 
//add offer
router.post('/addproductoffer',offerController.addProductOffer)
router.post('/addcategoryoffer',offerController.addCategoryOffer)

//edit offer
router.get('/productoffers/:offerId',adminAuth.adminAuth,offerController.getProductOffers)
router.get('/categoryoffers/:id',adminAuth.adminAuth, offerController.getCategoryOffers)
router.post('/updatecategoryoffer/:id',offerController.editCategoryOffer)
router.post('/updateproductoffer/:id',offerController.editProductOffer)

//delete offer
router.delete('/deletecategoryoffer/:id', offerController.deleteCategoryOffer)
router.delete('/deleteproductoffer/:id', offerController.deleteProductOffer)


router.get('/outofstock',adminAuth.adminAuth, productController.displayOutOfStockProductList)
router.get('/awaitingorders',adminAuth.adminAuth,orderController.adminAwaitingOrderPage)

router.get('/logout', adminController.adminLogout);


router.get('/messages',adminAuth.adminAuth, adminController.getMessages);
module.exports = router;




