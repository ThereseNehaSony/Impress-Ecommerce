
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
