const mongoose = require("mongoose");
const Listing = require("./models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function fixImages() {
  await mongoose.connect(MONGO_URL);

  console.log("Connected to DB...");

  // 1️⃣ Case: image is stored as a plain string
  const stringImages = await Listing.find({ image: { $type: "string" } });
  for (let doc of stringImages) {
    await Listing.updateOne(
      { _id: doc._id },
      { $set: { image: { url: doc.image } } }
    );
    console.log(`✅ Fixed string image for: ${doc._id}`);
  }

  // 2️⃣ Case: image object exists but url is empty or missing
  const brokenImages = await Listing.find({
    $or: [
      { "image.url": { $exists: false } },
      { "image.url": "" }
    ]
  });

  for (let doc of brokenImages) {
    await Listing.updateOne(
      { _id: doc._id },
      {
        $set: {
          image: {
            url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
          }
        }
      }
    );
    console.log(`🔧 Fixed empty/missing url for: ${doc._id}`);
  }

  console.log("🎉 All listings fixed!");
  await mongoose.disconnect();
}

fixImages().catch(err => {
  console.error("Error fixing images:", err);
});
