const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js"); //To throw a custom Express error
const {listingSchema, reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");

const app = express();

app.listen(8080, () => {
    console.log("Server is listening to port 8080!");
})

let mongo_url = "mongodb://127.0.0.1:27017/jetsetglobe";

main()
.then( () => {
    console.log("DB connected");
})
.catch((err) => {
    console.log(err);
})

async function main() {
    await mongoose.connect(mongo_url);
}

//EJS Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Middleware
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));

//To use static files
app.use(express.static(path.join(__dirname, "/public")));

//EJS-Mate: To use reusable components in other webpages, such as navbar, footer etc. No need to write repeated code for every web page
app.engine("ejs", ejsMate);

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(400, errMsg);
    }
    else {
        next();
    } 
}

const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(400, errMsg);
    }
    else {
        next();
    } 
}

//Routes
app.get("/", (req, res) => {
    res.send("This is the root!");
})

//INDEX ROUTE
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}))

//NEW ROUTE
app.get("/listings/new", async (req, res) => {
    res.render("listings/new.ejs");
})


//CREATE ROUTE
app.post("/listings", validateListing, wrapAsync(async (req, res, next) => {
    // if(!req.body.listing) {
    //     throw new ExpressError(400, "Send valid data for listing");
    // } //To be used when not using Joi

    let newListing = new Listing(req.body.listing); //Create a new Mongoose document
    await newListing.save();
    res.redirect("/listings");
    // catch(err) {
    //     // console.log(err);
    //     // res.status(500).send("Failed to create a listing.");
    //     next(err);
    // }
}))

//SHOW ROUTE
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing) {
        res.status(404).send("Listing not found.");
    }
    res.render("listings/show.ejs", {listing});
    
    
    // catch (error) {
    //     console.log(error);
    //     res.status(500).send("Internal Server Error");
    // }
}))

//EDIT ROUTE
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}))

//UPDATE ROUTE
app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
    // if(!req.body.listing) {
    //     throw new ExpressError(400, "Send valid data for listing");
    // }
    let {id} = req.params;
    let updatedListing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    if(!updatedListing) {
        res.status(404).send("Listing not found.");
    }
    res.redirect(`/listings/${id}`);
    
    // catch(err) {
    //     console.log(err);
    //     res.status(500).send("Failed to update the listing.");
    // }
    
}))

///DELETE ROUTE
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}))

//REVIEWS
//POST ROUTE
app.post("/listings/:id/reviews", validateReview, wrapAsync(async(req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
}))

app.all("*", (res, req, next) => {
    next(new ExpressError(404, "Page not found!"));
})

app.use((err, req, res, next) => {
    let {statusCode=500, message="Something went wrong!"} = err; //Extracting statusCode and message fields from err
    // res.status(statusCode).send(message);
    res.status(statusCode).render("listings/error.ejs", {err});
})
// app.put("/listings/:id", async (req, res) => {
//     const { id } = req.params;
//     console.log("Request body for update:", req.body.listing);  // Debug log
    
//     try {
//         const updatedListing = await Listing.findByIdAndUpdate(id, req.body.listing, {
//             new: true,  // Return the updated document
//             runValidators: true,  // Ensure validation is run
//         });

//         if (!updatedListing) {
//             return res.status(404).send("Listing not found.");
//         }

//         console.log("Updated listing:", updatedListing);  // Debug log
//         res.redirect(`/listings/${id}`);
//     } catch (err) {
//         console.error("Error updating listing:", err);
//         res.status(500).send("Failed to update the listing.");
//     }
// });

// app.get("/tryListing", async (req, res) => {
//     let sampleListing = new Listing({
//         title: "ABC Villa",
//         description: "Facing the beach and soothing sounds of sea waves hitting the shore.",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India"
//     });

//     await sampleListing.save();
//     console.log("Sample listing saved");
//     res.send("Testing successful");
// })

