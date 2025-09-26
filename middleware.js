  const Listing = require("./models/listing");
  const ExpressError = require("./utils/ExpressError.js");
  const {listingSchema, reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");
  
  module.exports.isloggedIn = (req, res, next) => {
     
    if (!req.isAuthenticated()) {
      req.session.redirectUrl = req.originalUrl;
      req.flash("error", "you must be signed in first");
      return res.redirect("/login");    
  }
  next();
};
module.exports.saveRedirectUrl = (req , res, next)=>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req , res , next)=>{
  let { id } = req.params;
  let listing = await Listing.findById(id);
     if(!listing.owner._id.equals(req.user._id)){
      req.flash("error", "you are not authorized to do that")
      return res.redirect(`/listings/${id}`);
     }
     next();

};

module.exports.validatelisting = (req, res, next) => {
  const result = listingSchema.validate(req.body); // result is an object with "error" and "value"

  if (result.error) {
    let msg = result.error.details.map(el => el.message).join(",");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};

// review validation

module.exports.validateReview = (req , res , next)=>{
   let {error} =reviewSchema.validate(req.body);
  console.log(error);
  if(error){
        throw new ExpressError(400, error)

  }else{
    next();
  }
};

module.exports.isreviewAuther = async (req , res , next)=>{
  let { id ,reviewId } = req.params;
  let review = await Review.findById(reviewId);
     if(!review.auther.equals(req.user._id)){
      req.flash("error", "you are not auther of this review")
      return res.redirect(`/listings/${id}`);
     }
     next();

};