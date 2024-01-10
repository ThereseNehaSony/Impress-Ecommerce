const express=require('express')
const session = require("express-session");

const userAuth= (req,res,next)=>{
    if(req.session.user){
        next();
    }else{
        res.redirect('/login')
    }
}
const isLoggedIn = (req, res, next) => {
    if (req.session.user) {
      return res.redirect('/'); 
    }else{
        
    }
    next();
  };
  
  module.exports = {userAuth,
               isLoggedIn };

// module.exports = userAuth;