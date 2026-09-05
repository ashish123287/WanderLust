# we will use ejs mate

# Schema Validation :-
Using JOI package
app.post("/listings", wrapAsync(async (req, res, next)=>{
        if(!req.body.listing){       // *this checks only when listing object is not available but what if listing is available but some fields are missing then we will use mongoose validation in the model to check for required fields (or we can use joi validation :- we will use this only) (also we can do this by writing same if condition but it is not optimised way of writing that)*
            throw new ExpressError(400, "Invalid Listing Data");
        }
        let listing = req.body.listing;
        const newListing = new Listing(listing); // Listing is our mongoose model
        await newListing.save();
        res.redirect("/listings");
    })
);

*We will define a schema for server-side validation*
Since we have alreaady done this in mongoose so we didn't need it here but we can use Joi for server side validation in our further projects
