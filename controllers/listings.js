 const {listingSchema} = require("../schema.js");
 const Listing = require("../models/listing.js");
 const mongoose = require("mongoose");
 const mbxgeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
//  const mapToken = process.env.mapToken;
//  const geocodingClient = mbxgeocoding({ accessToken: mapToken });
  const axios = require("axios");

//  module.exports.index =async (req , res)=>{
//     const alllistings = await Listing.find({});
//      res.render("listings/index.ejs",{alllistings})
    
//  };
// module.exports.index = async (req, res) => {
//   let query = {};

//   if (req.query.search) {
//     const regex = new RegExp(req.query.search, "i"); // i = case-insensitive
//     query = {
//       $or: [
//         { title: regex },       // title me search karega
//         { location: regex }     // location me search karega
//       ]
//     };
//   }

//   const listings = await Listing.find(query);
//   if (req.query.search && listings.length === 0) {
//     // Flash message set karo
//     req.flash("error", `No listings found for "${req.query.search}"`);
//     return res.redirect("/listings"); // redirect to all listings
//   }
//   res.render("listings/index", { listings, search: req.query.search || "" });
// };

module.exports.index = async (req, res) => {
  let query = {};

  // Search by input text
  if (req.query.search) {
    const regex = new RegExp(req.query.search, "i");
    query.$or = [
      { title: regex },
      { location: regex }
    ];
  }

  // Filter by category
  if (req.query.category) {
    query.category = req.query.category;
  }

  const listings = await Listing.find(query);

  // Flash message if no result
  if ((req.query.search || req.query.category) && listings.length === 0) {
    req.flash("error", `No listings found for your filter`);
    return res.redirect("/listings");
  }

  res.render("listings/index", { listings, search: req.query.search || "" });
};

 module.exports.renderNewForm =  (req , res)=>{
  
   res.render("listings/new.ejs")
};
module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  mapToken: process.env.mapToken

  // ✅ validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid Listing ID");
  }

  try {
    const listing = await Listing.findById(id).populate({path:"reviews",populate:{path:"auther"} },).populate("owner");

    if (!listing) {
     req.flash("error", "listing not found")
    return res.redirect("/listings") }
    console.log(listing)
    
    res.render("listings/show.ejs", { listing,mapToken: process.env.MAP_TOKEN });
    // console.log("MAP TOKEN in showListing:", process.env.MAP_TOKEN);
  } catch (err) {
    console.error("Error fetching listing:", err);
    res.status(500).send("Server Error");
  }
  console.log("MAP_TOKEN:", process.env.MAP_TOKEN)
  
};
module.exports.createListing = async (req, res, next) => {
  try {
    const location = req.body.listing.location || "Lucknow, India";

    // 🔹 Call RapidAPI for geocoding
    const geoRes = await axios.get(
      "https://forward-reverse-geocoding.p.rapidapi.com/v1/search",
      {
        params: { q: location, format: "json", limit: 1 },
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
          "x-rapidapi-host": "forward-reverse-geocoding.p.rapidapi.com",
        },
      }
    );

    let coordinates = [0, 0]; // default fallback
    if (geoRes.data && geoRes.data.length > 0) {
      const lat = geoRes.data[0].lat;
      const lon = geoRes.data[0].lon;
      coordinates = [lon, lat]; // GeoJSON expects [longitude, latitude]
      console.log(`✅ Coordinates for ${location}:`, coordinates);
    } else {
      console.log("⚠️ No coordinates found for:", location);
    }

    // 🔹 Validate request body
    if (!req.body.listing) {
      throw new ExpressError(400, "Send valid data for listing");
    }

    // 🔹 File handling (Cloudinary upload path + filename)
    const url = req.file?.path || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e";
    const filename = req.file?.filename || "default";

    // 🔹 Create new listing
    const newListing = new Listing({
      ...req.body.listing,
      owner: req.user._id,
      image: { url, filename },
      geometry: {
        type: "Point",
        coordinates: coordinates,
      },
    });

    // 🔹 Save listing
    const savedListing = await newListing.save();
    console.log("✅ Saved Listing:", savedListing);

    req.flash("success", "New listing created successfully!");
    res.redirect(`/listings/${savedListing._id}`);
  } catch (err) {
    console.error("❌ Error creating listing:", err.message);
    next(err); // Pass error to Express error handler
  }
};

 module.exports.renderEditForm = async (req , res)=>{
 const { id } = req.params;    
     if (!mongoose.Types.ObjectId.isValid(id)) {
       return res.status(400).send("Invalid Listing ID");
     }
     const listing = await Listing.findById(id);
     if (!listing) {
     req.flash("error", "listing not found")
     return res.redirect("/listings")  
      }
      let originalImageUrl = listing.image.url;
      originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_300,h_250");

     res.render("listings/edit.ejs",{listing, originalImageUrl});
 };

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid Listing ID");
  }

  // ✅ Update listing fields (except image)
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

  // ✅ Only update image if a new file was uploaded
  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "listing updated successfully");
  res.redirect(`/listings/${id}`);
};


module.exports.deleteListing = async(req ,res)=>{
    let {id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid Listing ID");
    }
   let deletedlisting = await Listing.findByIdAndDelete(id);
   console.log(deletedlisting);
   req.flash("success", "listing deleted successfully")
   res.redirect("/listings");
}
