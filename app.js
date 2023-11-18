const express = require('express');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
const session = require("express-session");
const nocache = require("nocache");
// const User = require("../models/user");
const mongoose = require('mongoose');

dotenv.config();

const app = express();

// View engine
app.set('view engine', 'ejs');

// Middleware
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(nocache());
app.use(morgan('tiny'));

app.use(session({ 
    secret: 'your-secret-key', 
    resave: true, 
    saveUninitialized: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));



mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB...');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });


// Router
const userrouter = require('./routes/userrouter');
const adminrouter = require('./routes/adminrouter');

app.use('/', userrouter);
app.use('/admin', adminrouter)


//Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
