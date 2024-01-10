const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

const uploadSingle = upload.single('image');


module.exports = upload;




const Category = require('./models/category');

// Using async/await
async function fetchCategories() {
  try {
    const categories = await Category.find({});
    console.log(categories);
  } catch (err) {
    console.error(err);
  }
}

// Invoke the function
fetchCategories();





const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require("../models/user");
const userController = require('../controllers/usercontroller');
const adminController = require("../controllers/admincontroller");
// const signupValidation = require('../middleware/signupValidation');
const otpController = require("../controllers/otpcontroller");

router.get('/index', userController.showHomePage);
router.get('/', userController.showHomePage);
router.get('/productlist', userController.getProductList);
router.get('/contactus', userController.showContactPage);
router.get('/login', userController.showLoginPage);
router.get('/signup', userController.showSignupForm);


// User signup route
router.post('/signup', userController.signupUser);

// Show OTP verification page
router.get('/otp', userController.showOtpPage);

// Verify OTP and redirect to home/dashboard
// router.post('/otp', userController.otpsender);

// Redirect to user dashboard after successful OTP verification
// router.get('/index', userController.toUserdash);




router.get('/products/:category', userController.renderProductsByCategory);
router.get('/products/view/:productId', userController.viewProduct);





module.exports = router;
 



<%- include('header')-%>

<div class="container mt-4">
    <!-- <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="#">Home</a></li>
            <li class="breadcrumb-item"><a href="#">Sarees</a></li>
           
        </ol>
    </nav> -->
<div style="height: 60px;">

</div>

<u><h2>Products in  <%= category %></h2></u>

  
<div class="product-list">
  <% if (products.length > 0) { %>
    <div class="row">
      <% products.forEach((product, index) => { %>
        <div class="col-md-4">
          <div class="product">
            <a href="/products/view/<%= product._id %>">
              <img src="/uploads/<%= product.mainPhoto %>" alt="<%= product.name %> Main Photo" class="product-image" height="400px" width="400px">
              <div class="product-details">
                <h5 style="margin-left: 30px;"><%= product.name %></h5>                
                <p style="margin-left: 30px;">₹<%= product.price.toFixed(2) %></p></a>
               <button class="btn btn-outline-success" style="margin-left: 30px; width:20vw;" >Add to cart</button>
              </div>
            
          </div>
        </div>
        <% if ((index + 1) % 3 === 0) { %>
          </div><div class="row">
        <% } %>
      <% }); %>
    </div>
  <% } else { %>
    <p>No products found in this category.</p>
  <% } %>
</div>


<div class="container text-center">
<nav aria-label="Page navigation example " >
    <ul class="pagination justify-content-center">
      <li class="page-item">
        <a class="page-link" href="#" aria-label="Previous">
          <span aria-hidden="true">&laquo;</span>
          <span class="sr-only">Previous</span>
        </a>
      </li>
      <li class="page-item"><a class="page-link" href="#">1</a></li>
      <li class="page-item"><a class="page-link" href="#">2</a></li>
      <li class="page-item"><a class="page-link" href="#">3</a></li>
      <li class="page-item">
        <a class="page-link" href="#" aria-label="Next">
          <span aria-hidden="true">&raquo;</span>
          <span class="sr-only">Next</span>
        </a>
      </li>
    </ul>
  </nav>
</div>

<%- include('footer')-%>




<%- include('header')-%>

<div class="container-fluid">
    <div class="row">
        <!-- Sidebar -->
        <div class="col-lg-3 col-md-4 col-sm-12">
            <div class="sidebar">
                <h4>Filter by Size</h4>
                <ul>
                  
                </ul>
            </div>

            <!-- Filter by product type -->
            <div class="sidebar-section">
                <h4>Filter by Type</h4>
                <ul>
                    <!-- ... (product type filter checkboxes) ... -->
                </ul>
            </div>

            <!-- Filter by availability -->
            <div class="sidebar-section">
                <h4>Filter by Availability</h4>
                <ul>
                    <!-- ... (availability filter checkboxes) ... -->
                </ul>
            </div>

            <!-- Sort options -->
            <div class="sidebar-section">
                <h4>Sort by</h4>
                <select id="sortOptions" name="sortOptions">
                    <!-- ... (sorting options) ... -->
                </select>
            </div>
        </div>

        <!-- Product Display Section -->
        <div class="col-lg-9 col-md-8 col-sm-12">
            <div class="row">
                <div class="col-lg-12">
                    <u><h2>Products in <%= category %></h2></u>
                </div>

                <% if (products.length > 0) { %>
                    <% products.forEach((product, index) => { %>
                        <div class="col-lg-4 col-md-4 col-sm-6 d-flex flex-column align-items-center justify-content-center product-item my-3">
                            <div class="product">
                                <a href="/products/view/<%= product._id %>">
                                    <!-- ... (product image and icons) ... -->
                                </a>
                            </div>
                            <!-- Product details -->
                            <div class="title pt-4 pb-1"><%= product.name %></div>
                            <div class="d-flex align-content-center justify-content-center">
                                <!-- ... (additional details/icons) ... -->
                            </div>
                            <div class="price mt">₹ <%= product.price.toFixed(2) %></div>
                        </div>
                    <% }); %>
                <% } else { %>
                    <div class="col-lg-12">
                        <p>No products found in this category.</p>
                    </div>
                <% } %>
            </div>
        </div>
    </div>
</div>

<%- include('footer')-%>
