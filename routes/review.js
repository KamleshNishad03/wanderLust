const express = require("express");
// const router = express.Router();
const router = express.Router({ mergeParams: true });
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {listingSchema, reviewSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const mongoose = require("mongoose");
const Review = require("../models/review.js");

// validation function
const validateReview = (req , res , next)=>{
   let {error} =reviewSchema.validate(req.body);
  console.log(error);
  if(error){
        throw new ExpressError(400, error)

  }else{
    next();
  }
}

//post reviews route

router.post("/",validateReview, wrapAsync(async (req , res)=>{
       let { id } = req.params;
       if (!mongoose.Types.ObjectId.isValid(id)) {
         return res.status(400).send("Invalid Listing ID");
       }
       let listing = await Listing.findById(id);
       if (!listing) {
         return res.status(404).send("Listing not found");
       }
       let newReview = new Review(req.body.review);
       listing.reviews.push(newReview);
       await newReview.save();
       await listing.save();
       req.flash("success", "new review created successfully")
      res.redirect(`/listings/${listing._id}`);

}))

//Delete Reviews Route
router.delete("/:reviewId" , wrapAsync( async(req , res)=>{
  let {id , reviewId} = req.params;
  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(reviewId)) {
    return res.status(400).send("Invalid ID");
  }
await  Listing.findByIdAndUpdate(id, {$pull:{reviews:reviewId}})
await Review.findByIdAndDelete(reviewId);
req.flash("success", "new review deleted successfully")
 res.redirect(`/listings/${id}`)
}));

module.exports = router;

