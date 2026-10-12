const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner} = require("../middleware.js");

// index route to get all listings
router.get("/", async (req, res) => {
    const listings = await Listing.find({});
    res.render("listings/index.ejs", { listings });
});

// New Route  :- (to fill the form to create a new listing)
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
});

// create route 
router.post("/", isLoggedIn, wrapAsync(async (req, res, next)=>{
        if(!req.body.listing){       // this checks only when listing object is not available but what if listing is available but some fields are missing then we will use mongoose validation in the model to check for required fields (or we can use joi validation :- we will use this only) (also we can do this by writing same if condition but it is not optimised way of writing that)
            throw new ExpressError(400, "Invalid Listing Data");
        }
        let listing = req.body.listing;
        const newListing = new Listing(listing); // Listing is our mongoose model
        newListing.owner = req.user._id; // we assign the owner of the listing to the user who is logged in (we get the user from passport.js)
        await newListing.save();
        req.flash("success", "New Listing Created Successfully!");
        res.redirect("/listings");
    })
);

// show route to get a single listing by id
router.get("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews").populate("owner");
    if(!listing){
        req.flash("error", "Listing Not Found!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}));

// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews").populate("owner");
    if(!listing){
        req.flash("error", "Listing Not Found!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
}));

// Update Route
router.put("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        { runValidators: true }
    );

    req.flash("success", "Listing Updated Successfully!");
    res.redirect(`/listings/${id}`);
}));

router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted Successfully!");
    res.redirect("/listings");
}));

module.exports = router;