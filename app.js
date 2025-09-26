  if( process.env.NODE_ENV !== "production"){
    require('dotenv').config()
  }

const mongodb = require("mongodb");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingsRouter = require("./routes/listings.js")
const reviewsRouter =require("./routes/review.js")
const userRouter =require("./routes/user.js")


// const MONGO_URL = "mongodb+srv://KamleshNishad03:rCYIDm6P6Vj2Detl@cluster0.ti3vpsm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const dburl =process.env.ATLASDB_URL

// main().then(() => {
//     console.log("connected to db");
// }).catch((err) => {
//     console.log(err);
// });
// async function main() {
//     await mongoose.connect(dburl);
// }
// const dbUrl = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  try {
    await mongoose.connect(dburl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
  }
}
main();




app.set("view engine" , "ejs");
app.set("views", path.join(__dirname , "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
// removed duplicate express.static
app.use(express.json());


const store = MongoStore.create({
  mongoUrl:dburl,
  crypto:{
    secret: process.env.SECRET
  },
   touchAfter: 24*60*60
});

store.on("error",()=>{
  console.log("error in mongo session store", err);
})
const sessionOptions = {
  store:store,
  secret: process.env.SECRET,
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires: Date.now() + 1000*60*60*24*7,
    maxAge: 1000*60*60*24*7,
    httpOnly:true,
  }
  
};
//home route
// app.get("/",(req , res)=>{
//     res.send("this is home route")
// });



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
  res.locals.currentUser = req.user;
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


// testing routes

app.get("/api/location", async (req, res) => {
  const { place } = req.query; // e.g. /api/location?place=Gorakhpur
  if (!place) {
    return res.status(400).json({ error: "Place is required" });
  }

  try {
    const data = await fetchLocation(place);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch location" });
  }
});


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