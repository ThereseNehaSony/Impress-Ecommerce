const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admincontroller');
const adminAuth = require('../middleware/adminAuth');





router.get('/', adminController.adminLoginPage);
router.post('/login', adminController.adminLogin);
router.get('/admindash', adminAuth, adminController.adminDashboard);
router.get('/product', adminController.adminProductPage);
router.get('/logout', adminController.adminLogout);




module.exports = router;




