const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require("../models/user");
const userController = require('../controllers/usercontroller');
// const signupValidation = require('../middleware/signupValidation');


router.get('/index', userController.showIndexPage);
router.get('/', userController.showHomePage);
router.get('/contactus', userController.showContactPage);
router.get('/login', userController.showLoginPage);
router.get('/signup', userController.showSignupForm);
// router.post('/signup', userController.signupUser); 
router.post('/signup', userController.showOtpPage); 
// router.get('/',userController.showOtpPage)





module.exports = router;
