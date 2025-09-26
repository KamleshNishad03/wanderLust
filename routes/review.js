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
const reviewController = require("../controllers/reviews.js");



//post reviews route

router.post("/",isloggedIn,validateReview, wrapAsync(reviewController.postReview));

//Delete Reviews Route
router.delete("/:reviewId",isloggedIn ,isreviewAuther, wrapAsync(reviewController.deleteReview ));

module.exports = router;

