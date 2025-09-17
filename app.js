const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingsRouter = require("./routes/listings.js")
const reviewsRouter =require("./routes/review.js")
const userRouter =require("./routes/user.js")


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {
    console.log("connected to db");
}).catch((err) => {
    console.log(err);
});
async function main() {
    await mongoose.connect(MONGO_URL);
}
app.set("view engine" , "ejs");
app.set("views", path.join(__dirname , "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
// removed duplicate express.static
app.use(express.json());

const sessionOptions = {
  secret:"mysupersecret",
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires: Date.now() + 1000*60*60*24*7,
    maxAge: 1000*60*60*24*7,
    httpOnly:true,
  }
  
};
//home route
app.get("/",(req , res)=>{
    res.send("this is home route")
});

// session and flash configuration
app.use(session(sessionOptions));
app.use(flash());
// passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req , res , next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();

})

// app.get("/demouser" , async(req , res)=>{
//   let fakeuser = new User({
//     email:"student@gmail.com",
//     username:"student"
//   })
//  let registeruser =await User.register(fakeuser , "helloworld");
//  res.send(registeruser);
// })


app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);


// const validatelisting = (req, res, next) => {
//   const result = listingSchema.validate(req.body); // result is an object with "error" and "value"

//   if (result.error) {
//     let msg = result.error.details.map(el => el.message).join(",");
//     throw new ExpressError(400, msg);
//   } else {
//     next();
//   }
// };

// const validateReview = (req , res , next)=>{
//    let {error} =reviewSchema.validate(req.body);
//   console.log(error);
//   if(error){
//         throw new ExpressError(400, error)

//   }else{
//     next();
//   }
// }

app.use((req , res, next)=>{
  next(new ExpressError(404, "Page Not Found"));
})

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("listings/error.ejs",{err});
});

app.listen(8080,(req , res)=>{
    console.log("server is running at port 8080");
})