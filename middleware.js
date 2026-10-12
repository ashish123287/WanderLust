const Listing = require("./models/listing.js");
module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        // redirect
        req.session.redirectUrl = req.originalUrl; // this will store the url that the user was trying to access before being redirected to login page, so that after login we can redirect the user back to that url
        req.flash("error", "You must be logged in to create a listing!");
        return res.redirect("/users/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl; // this will make the redirectUrl available in all templates, so that we can use it in the login form to redirect the user back to the url they were trying to access before being redirected to login page
    };
    next();
};

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    if (!listing.owner || !listing.owner.equals(req.user._id)) {
        req.flash("error", "You are not authorized to edit this listing!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};