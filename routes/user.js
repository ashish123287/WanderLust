const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const {isLoggedIn, saveRedirectUrl} = require("../middleware.js");

// SIGNUP PAGE
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

// SIGNUP
router.post("/signup", async (req, res) => {
    try {
        let { email, username, password } = req.body;
        let user = new User({email, username});
        let registeredUser = await User.register(user, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {    // req.login is a method provided by passport to log in the user after registration, it puts the data of registered user in req.user (which was undefined before registration) and also creates a session for the user, similarly req.logout is a method provided by passport to log out the user, it removes the data of logged-in user from req.user and also destroys the session for the user
            if(err){
                req.flash("error", err.message);
                return res.redirect("/users/signup");
            }
            req.flash("success", "Successfully registered!");
            res.redirect(res.locals.redirectUrl || "/listings"); // redirect to the url that the user was trying to access before being redirected to login page, if there is no such url then redirect to /listings
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/users/signup");
    }
});

// LOGIN PAGE
router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});


// LOGIN
router.post("/login", saveRedirectUrl, passport.authenticate("local", {failureFlash: true, failureRedirect: "/users/login"}), (req, res) => {
        req.flash("success", "Logged in successfully!");
        let redirectUrl = res.locals.redirectUrl || "/listings";
        delete req.session.redirectUrl; // delete the redirectUrl from session after using it, so that it doesn't affect future logins
        res.redirect(redirectUrl);
    }
);

// LOGOUT
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Logged out successfully!");
        res.redirect("/listings");
    });
});


module.exports = router;