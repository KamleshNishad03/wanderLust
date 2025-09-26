// // const express = require("express");
// // const mogoose = require("mongoose");
// // const Schema = mongoose.Schema;

// // const listingSchema = new Schema({
// //     title:{
// //         type:String,
// //         required:true
// //     },
// //     description:{
// //         type: String
// //     },
// //     price: Number,
// //     location:String,
// //     country: String,
// // });
// // module.exports = Schema.model("Listing", listingSchema);
// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;

// const listingSchema = new Schema({
//   title: {
//     type: String,
//     required: true
//   },
//   description: String,
//    image: {
//     filename: String,
//     url:{
//         type: String,
//         default:"https://unsplash.com/photos/people-relaxing-by-a-river-with-a-stone-bridge-UvM8LXxgYHA",
//     }
//   },
// //   image :{
// //     filename: String,
// //     url: String,
// //     default:"https://unsplash.com/photos/people-relaxing-by-a-river-with-a-stone-bridge-UvM8LXxgYHA",
// //     // set:(v) => v ===""? "https://unsplash.com/photos/people-relaxing-by-a-river-with-a-stone-bridge-UvM8LXxgYHA" : v
// //   },
//   price: Number,
//   location: String,
//   country: String
// });

// module.exports = mongoose.model("Listing", listingSchema);
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js")

const listingSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  image: {
    // filename: String,
    // url: {
    //   type: String,
    //   default: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e" // direct image URL
    // }

    url: String,
    filename: String
  },
  
  price: {
    type: Number,
    default: 0
  },
  location: String,
  country: String,
  reviews:[
    {
    type: Schema.Types.ObjectId,
    ref:"Review",
}],
owner:{
  type:Schema.Types.ObjectId,
  ref:"User",
},
category: String,
geometry:{
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
});

listingSchema.post("findOneAndDelete", async(listing)=>{
  if(listing){
  await Review.deleteMany({_id:{$in:listing.reviews}})

  }


});

module.exports = mongoose.model("Listing", listingSchema);
