<!-- <img src="<%= category.imageUrl %>" alt="<%= category.name %>" class="img-fluid"> -->



router.get("/", (req, res) => {
    res.render('user/index'); 
});

//home
router.get("/home", (req, res) => {
    res.render('user/index'); 
});

//category shoping
router.get('/shop', (req, res) => {
    
    res.render('user/productlist'); 
});

//reachus
router.get('/contactus', (req, res) => {
    
    res.render('user/contactus'); 
});

//login page
router.get('/login', (req, res) => {
    res.render('user/login'); 
  });

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Set session data
    req.session.user = user;

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User signup route
// Router handling signup
router.post('/signup', async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    console.log(fullname, email, password); 

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ fullname, email, password: hashedPassword });
    await newUser.save();

    // Redirect to the 'otp' page after successful signup
    res.redirect('/user/otp');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});







// GET route to render the signup page
router.get('/signup', (req, res) => {
    res.render('user/signup'); 
  });
  
  
  router.post('/signup', (req, res) => {
 
    res.redirect('user/otp');
  });
  
  
  router.get('/otp', (req, res) => {
    res.render('user/otp'); 
  });
  


  router.get('/user/productview', (req, res) => {
    
    res.render('user/productview'); 
});
   


<div class="product-list">
  <% if (products.length > 0) { %>
    <div class="product-row">
      <% products.forEach((product, index) => { %>
        <div class="product">
          <img src="/uploads/<%= product.mainPhoto %>" alt="<%= product.name %> Main Photo">
          <h2><%= product.name %></h2>
          <p>₹: ₹<%= product.price.toFixed(2) %></p>
        </div>
        <% if ((index + 1) % 3 === 0 && index !== products.length - 1) { %>
          </div><div class="product-row">
        <% } %>
      <% }); %>
    </div>
  <% } else { %>
    <p>No products found in this category.</p>
  <% } %>
</div>


.product-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-between; /* To create space at both ends */
  padding: 0 20px; /* Adjust padding as needed */
  box-sizing: border-box;
}

.product-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
}

.product {
  flex: 0 0 calc(33.33% - 20px);
  /* Adjust the width as needed */
  text-align: center;
  margin-bottom: 20px; /* Creates space between rows */
}





<%- include('header')-%>
<div class="sidebar-section">
  <h4>Filter by Size</h4>
  <ul>
      <li>
          <label>
              <input type="checkbox" name="size" value="S"> S
          </label>
      </li>
      <li>
          <label>
              <input type="checkbox" name="size" value="M"> M
          </label>
      </li>
      <li>
          <label>
              <input type="checkbox" name="size" value="L"> L
          </label>
      </li>
      <li>
          <label>
              <input type="checkbox" name="size" value="XL"> XL
          </label>
      </li>
      <li>
          <label>
              <input type="checkbox" name="size" value="XXL"> XXL
          </label>
      </li>
  </ul>
</div>

<!-- Filter by product type -->
<div class="sidebar-section">
  <h4>Filter by Type</h4>
  <ul>
      <li>
          <label>
              <input type="checkbox" name="productType" value="Normal"> Normal
          </label>
      </li>
      <li>
          <label>
              <input type="checkbox" name="productType" value="Normal Saree"> Normal Saree
          </label>
      </li>
      <!-- Add more product type options as needed -->
  </ul>
</div>

<!-- Filter by availability -->
<div class="sidebar-section">
  <h4>Filter by Availability</h4>
  <ul>
      <li>
          <label>
              <input type="checkbox" name="availability" value="Available"> Available
          </label>
      </li>
      <li>
          <label>
              <input type="checkbox" name="availability" value="Out of stock"> Out of stock
          </label>
      </li>
  </ul>
</div>

<!-- Sort options -->
<div class="sidebar-section">
  <h4>Sort by</h4>
  <select id="sortOptions" name="sortOptions">
      <option value="priceAsc">Price: Low to High</option>
      <option value="priceDesc">Price: High to Low</option>
      <!-- Add more sorting options as needed -->
  </select>
</div>

<!-- Apply button -->
<div class="sidebar-section">
  <button onclick="applyFilters()">Apply</button>
</div>
</div>
<div class="main-content">
<div class="container bg-white">
  <u><h2 >Products in <%= category %></h2></u>
  <div class="row">
      <% if (products.length > 0) { %>
          <% products.forEach((product, index) => { %>
              <div class="col-lg-3 col-md-4 col-sm-6 d-flex flex-column align-items-center justify-content-center product-item my-3">
                  <div class="product">
                      <a href="/products/view/<%= product._id %>">
                          <img src="/uploads/<%= product.mainPhoto %>" alt="<%= product.name %> Main Photo" class="product-image" height="400px" width="400px">
                          <ul class="d-flex align-items-center justify-content-center list-unstyled icons">
                           
                              <li class="icon mx-3"><span class="fa fa-heart"></span></li>
                              <li class="icon"><span class="fa fa-shopping-bag"></span></li>
                          </ul>
                      </a>
                  </div>
                  <!-- Product details -->
                  
                  <div class="title pt-4 pb-1"><%= product.name %></div>
                  <div class="d-flex align-content-center justify-content-center">
                     
                  </div>
                  <div class="price mt">₹ <%= product.price.toFixed(2) %></div>
              </div>
          <% }); %>
      <% } else { %>
          <p>No products found in this category.</p>
      <% } %>
  </div>
</div>



<%- include('footer')-%></div>