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
const Product = require('../models/product');



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
router.get('/customers', adminController.displayUserList);
router.get('/toggleuserstatus/:userId',adminAuth.adminAuth, adminController.toggleCustomerStatus);



//coupon
router.get('/coupon',adminController.getCouponPage)
router.post('/addcoupon',adminController.addCoupon)
router.get('/editcoupon/:id',couponController.editCoupon );

router.put('/edit-coupon/:id',couponController.postEditCoupon );

router.delete('/delete-coupon/:id',couponController.deleteCoupon);




//order
router.get('/order',orderController.adminOrderPage)
router.get('/orderview/:orderId',orderController.adminOrderViewPage)
router.post("/updateOrderStatus/:orderId",orderController.updateOrderStatus)



//banner
router.get('/banner',bannerController.getBannerPage)
router.post('/addbanner',  bannerController.addBanner);
router.delete('/deletebanner/:bannerId', bannerController.deleteBanner);



//sales
router.get('/sales',adminController.adminSalesPage)

// router.get('/logout', adminController.adminLogout);

//offers

router.get('/productoffer', offerController.getProductOfferPage)
router.get('/categoryoffer',offerController.getCategoryOfferPage)
router.get('/categories', offerController.getCategory )
router.get('/products', offerController.getProduct )
 
//add offer
router.post('/addproductoffer',offerController.addProductOffer)
router.post('/addcategoryoffer',offerController.addCategoryOffer)

//edit offer
router.get('/productoffers/:offerId',offerController.getProductOffers)
router.get('/categoryoffers/:id', offerController.getCategoryOffers)
router.post('/updatecategoryoffer/:id',offerController.editCategoryOffer)
router.post('/updateproductoffer/:id',offerController.editProductOffer)

//delete offer
router.delete('/deletecategoryoffer/:id', offerController.deleteCategoryOffer)
router.delete('/deleteproductoffer/:id', offerController.deleteProductOffer)


router.get('/outofstock', productController.displayOutOfStockProductList)
router.get('/awaitingorders',orderController.adminAwaitingOrderPage)

module.exports = router;




