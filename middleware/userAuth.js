const express=require('express')
const session = require("express-session");

const userAuth= (req,res)=>{
    if(req.session.userLoggedIn){
        next()
    }else{
        res.redirect('/')
    }
}


module.exports = userAuth;