const mongoose = require("mongoose");
const data = require("./data.js");
const Listing = require("../models/listing.js");

main()
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/WanderLust');
}

const initDB = async () => {
    await Listing.deleteMany({}); // deletes all the previous listings in the database
    await Listing.insertMany(data.data); 
    console.log("Database initialized with data");
}

initDB().catch(err => console.log(err));