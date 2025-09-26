const express= require("express");
// const router = express.Router();
const User = require("../models/user.js");
// const wrapAsync = require("../utils/wrapAsync.js");
// const passport = require("passport");
// const {saveRedirectUrl} = require("../middleware.js");


// render signup form
module.exports.renderSignupForm = (req , res)=>{
    res.render("users/signup");
};
//sighnup logic
module.exports.signup = async(req , res)=>{
    try{
    let {username , email , password} = req.body;
   const newUser = new User({username , email});
  const registerUser = await User.register(newUser, password)
  console.log(registerUser);
  req.login(registerUser , (err)=>{
    if(err){ return next(err); 

     }
     req.flash("success" , "welcome to wanderlust");
    res.redirect("/listings");
  })

    }catch(err){
        req.flash("error" , err.message);
        res.redirect("/signup");
    }
};
//login logic
module.exports.login = async(req , res  )=>{
  req.flash("success" , "welcome back back to wanderlust");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
   
};
//logout logic
module.exports.logout = (req , res, next)=>{
    req.logout((err)=>{
        if(err){
         return next(err);
        }
        req.flash("success" , "you are logged out   now");
        res.redirect("/listings");
    })
}