const express = require('express');
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/reviews.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const sessionConfig = {
    secret: "thisshouldbeabettersecret!",
    resave: false,
    saveUninitialized: true,
    cookie : {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // expires in a week
        maxAge: 7*24*60*60*1000, // 7 days in milliseconds
        httpOnly: true
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // authenticate method is added by passport-local-mongoose

passport.serializeUser(User.serializeUser()); // means the information that Passport store in the session to identify the logged-in user
passport.deserializeUser(User.deserializeUser()); // means how to get the user information from the session

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user; // req.user is added by passport, it contains the currently logged-in user and we are making it available in all templates by adding it to res.locals
    next();
});


// just checking with fake user registration
app.get("/demoUser", async (req, res) => {
    let fakeUser = new User({
        email: "student@gmail.com",
        username: "student"
    });
    // registerUser = await User.register(fakeUser, password)
    let registeredUser = await User.register(fakeUser, "student123"); // register method is added by passport-local-mongoose, it will hash the password and store it in the database
    res.send(registeredUser);
});

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

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

app.use("/listings", listingRouter);
app.use("/listings", reviewRouter);
app.use("/users", userRouter);

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