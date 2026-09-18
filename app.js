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

const listings = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");

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

app.use("/listings", listings);
app.use("/listings", reviewRouter);

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