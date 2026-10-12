
const mongoose = require("mongoose");
const data = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

main()
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/WanderLust');
}

const initDB = async () => {
    await Listing.deleteMany({});
    const user = await User.findOne({ username: "ashish" });
    if (!user) throw new Error('User "ashish" not found');

    data.data = data.data.map((obj) => ({
        ...obj,
        owner: user._id
    }));

    await Listing.insertMany(data.data);
    console.log("Database initialized with data");
}

initDB().catch(err => console.log(err));
