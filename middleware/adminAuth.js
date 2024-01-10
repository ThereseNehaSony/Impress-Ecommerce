const express=require('express')
const session = require("express-session");
const app=express()
app.use(express.urlencoded({ extended: true }));

const adminAuth = (req, res, next) => {
    if (req.session.adminLoggedIn) {
      next();
    } else {
      res.redirect('/admin');
    }
  };
  const isLoggedIn = (req, res, next) => {
    if (req.session.adminLoggedIn) {
      res.redirect('/admin/admindash'); 
    } else {
      next(); 
    }
  };

  
  module.exports = {
    adminAuth,
    isLoggedIn
  }
  