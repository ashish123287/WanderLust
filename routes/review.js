const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const Review = require("../models/reviews.js");


// Create Review
router.post("/:id/reviews", wrapAsync(async (req, res) => {

    let { id } = req.params;
    let { review } = req.body;

    if (!review) {
        throw new ExpressError(400, "Invalid Review Data");
    }

    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    const newReview = new Review(review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${id}`);
}));


module.exports = router;