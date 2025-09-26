const express = require("express");
// const router = express.Router();
const router = express.Router({ mergeParams: true });
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {listingSchema, reviewSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const mongoose = require("mongoose");
const Review = require("../models/review.js");
const {validateReview } = require("../middleware.js");
const { isloggedIn,isreviewAuther } = require("../middleware.js");




module.exports.postReview = async (req , res)=>{
       let { id } = req.params;
       if (!mongoose.Types.ObjectId.isValid(id)) {
         return res.status(400).send("Invalid Listing ID");
       }
       let listing = await Listing.findById(id);
       if (!listing) {
         return res.status(404).send("Listing not found");
       }
       let newReview = new Review(req.body.review);
        newReview.auther = req.user._id;
        console.log(newReview);
       listing.reviews.push(newReview);
       await newReview.save();
       await listing.save();
       req.flash("success", "new review created successfully")
      res.redirect(`/listings/${listing._id}`);

};
module.exports.deleteReview = async(req , res)=>{
  let {id , reviewId} = req.params;
  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(reviewId)) {
    return res.status(400).send("Invalid ID");
  }
await  Listing.findByIdAndUpdate(id, {$pull:{reviews:reviewId}})
await Review.findByIdAndDelete(reviewId);
req.flash("success", " review deleted successfully")
 res.redirect(`/listings/${id}`)
}