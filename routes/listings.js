const express = require("express");
const router = express.Router();
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {listingSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const mongoose = require("mongoose");

// validation function
const validatelisting = (req, res, next) => {
  const result = listingSchema.validate(req.body); // result is an object with "error" and "value"

  if (result.error) {
    let msg = result.error.details.map(el => el.message).join(",");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};
// index route for showing all lists
 router.get("/", async (req , res)=>{
    const alllistings = await Listing.find({});
     res.render("listings/index.ejs",{alllistings})
    
 });

 //new route
router.get("/new", (req , res)=>{
   res.render("listings/new.ejs")
})
//show route
router.get("/:id",wrapAsync( async (req, res) => {
  const { id } = req.params;

  // ✅ validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid Listing ID");
  }

  try {
    const listing = await Listing.findById(id).populate("reviews");

    if (!listing) {
     req.flash("error", "listing not found")
    return res.redirect("/listings") }

    res.render("listings/show.ejs", { listing });
  } catch (err) {
    console.error("Error fetching listing:", err);
    res.status(500).send("Server Error");
  }
}));
//create route
router.post("/" ,validatelisting
  ,wrapAsync( async (req, res, next) => {
  // validatelisting already checked req.body
  if(!req.body.listing){
    throw new ExpressError(400, "send valid data for listing")
  }
 
   if (!req.body.listing.image || !req.body.listing.image.url) {
    req.body.listing.image = {
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      filename: "default"
    };
  }

  const newListing = new Listing(req.body.listing);

  await newListing.save();
  req.flash("success", "new listing created successfully")
  res.redirect("/listings");
 } )

);

//edit route
router.get("/:id/edit", async (req , res)=>{
const { id } = req.params;    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid Listing ID");
    }
    const listing = await Listing.findById(id);
    if (!listing) {
    req.flash("error", "listing not found")
    return res.redirect("/listings")  
     }
    res.render("listings/edit.ejs",{listing});
});

//update route
router.put("/:id",validatelisting,wrapAsync( async (req, res) => {
  
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid Listing ID");
  }

  if (!req.body.listing.image || !req.body.listing.image.url) {
    req.body.listing.image = {
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      filename: "default"
    };
  }

  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  req.flash("success", "listing updated successfully")
  res.redirect(`/listings/${id}`);
}));

// delete route

router.delete("/:id",wrapAsync( async(req ,res)=>{
    let {id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid Listing ID");
    }
   let deletedlisting = await Listing.findByIdAndDelete(id);
   console.log(deletedlisting);
   req.flash("success", "listing deleted successfully")
   res.redirect("/listings");
}));
module.exports =router;