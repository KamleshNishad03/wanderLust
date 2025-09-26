const express = require("express");
const router = express.Router();
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {listingSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const mongoose = require("mongoose");
const {isloggedIn, isOwner , validatelisting } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer')
const {storage} = require('../cloudConfig.js')
const upload = multer({ storage });


router.route("/")
.get(wrapAsync(listingController.index ))// index route for showing all lists
.post(isloggedIn,upload.single('listing[image][url]') ,validatelisting,wrapAsync( listingController.createListing ));


 //new route
router.get("/new",isloggedIn,listingController.renderNewForm);

router.route("/:id")
.get(wrapAsync( listingController.showListing))
.put(isloggedIn,isOwner,upload.single('listing[image][url]'),validatelisting,wrapAsync(listingController.updateListing ))
.delete(isOwner,isloggedIn,wrapAsync( listingController.deleteListing));

//edit route
router.get("/:id/edit",isOwner,isloggedIn, listingController.renderEditForm);



module.exports =router;