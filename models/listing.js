const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const listingSchema = new Schema({

    title: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100,
        trim: true
    },

    description: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 1000,
        trim: true
    },

    image: {
        filename: {
            type: String,
            default: "listingimage"
        },

        url: {
            type: String,
            default: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b"
        }
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    location: {
        type: String,
        required: true,
        trim: true
    },

    country: {
        type: String,
        required: true,
        trim: true
    }

});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;