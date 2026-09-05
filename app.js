const express = require('express');
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

app.use(methodOverride("_method"));

main()
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/WanderLust');
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate); 
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

// index route to get all listings
app.get("/listings", async (req, res) => {
    const listings = await Listing.find({});
    res.render("listings/index.ejs", { listings });
});

// New Route  :- (to fill the form to create a new listing)
app.get("/listings/new",(req,res) => {
    res.render("listings/new.ejs");
});

app.post("/listings", wrapAsync(async (req, res, next)=>{
        if(!req.body.listing){       // this checks only when listing object is not available but what if listing is available but some fields are missing then we will use mongoose validation in the model to check for required fields (or we can use joi validation :- we will use this only) (also we can do this by writing same if condition but it is not optimised way of writing that)
            throw new ExpressError(400, "Invalid Listing Data");
        }
        let listing = req.body.listing;
        const newListing = new Listing(listing); // Listing is our mongoose model
        await newListing.save();
        res.redirect("/listings");
    })
);

// show route to get a single listing by id
app.get("/listings/:id",wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
}));

// Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

// Update Route
app.put("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let { listing } = req.body;
    await Listing.findByIdAndUpdate(id, { ...listing });
    res.redirect(`/listings/${id}`);
}));

app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

// app.get("/testListing", async (req, res) => {
//     const newListing = new Listing({
//         title: "Test Listing",
//         description: "This is a test listing.",
//         image: "Major Project/models/krzhck-B7n4l4sJ2O0-unsplash.jpg",
//         price: 100,
//         location: "Madhubani Bihar",
//         country: "India"
//     })   
//     await newListing.save();
//     res.send("Test listing created!");
// });

app.all("/{*splat}", (req, res, next) => {           // when the route doesnt match above an route
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let { statusCode=500, message="Something went wrong" } = err;
    res.status(statusCode).send(message);
})

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});