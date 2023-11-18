const adminCredentials = {
  email: 'admin@gmail.com',
  password: 'admin123'
};

const adminController = {
  adminLoginPage: (req, res) => {
    res.render('admin/adminlogin', { title: 'Admin Login', error: req.session.loginError || null });
    req.session.loginError = null; 
  },

  adminLogin: (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      req.session.loginError = 'Please provide email and password.';
      res.redirect('/admin');
      return;
    }

    if (email === adminCredentials.email && password === adminCredentials.password) {
      req.session.adminLoggedIn = true;
      req.session.loginError = null; 
      res.redirect('/admin/admindash');
    } else {
      req.session.loginError = 'Invalid credentials.';
      res.redirect('/admin');
    }
  },

  adminDashboard: (req, res) => {
    res.render('admin/admindash', { title: 'Admin Home' });
  },
  adminProductPage:(req,res)=>{
    res.render('admin/products',{title:"Product List"});
  },
  adminLogout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
      }
      res.redirect('/admin');
    });
  }
};

module.exports = adminController;
