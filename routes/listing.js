const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js"); //To throw a custom Express error
const {listingSchema} = require("../schema.js");

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

//INDEX ROUTE
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}))

//NEW ROUTE
router.get("/new", async (req, res) => {
    res.render("listings/new.ejs");
})


//CREATE ROUTE
router.post("/", validateListing, wrapAsync(async (req, res, next) => {
    // if(!req.body.listing) {
    //     throw new ExpressError(400, "Send valid data for listing");
    // } //To be used when not using Joi

    let newListing = new Listing(req.body.listing); //Create a new Mongoose document
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
    // catch(err) {
    //     // console.log(err);
    //     // res.status(500).send("Failed to create a listing.");
    //     next(err);
    // }
}))

//SHOW ROUTE
router.get("/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing});
    
    
    // catch (error) {
    //     console.log(error);
    //     res.status(500).send("Internal Server Error");
    // }
}))

//EDIT ROUTE
router.get("/:id/edit", wrapAsync(async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", {listing});
}))

//UPDATE ROUTE
router.put("/:id", validateListing, wrapAsync(async (req, res) => {
    // if(!req.body.listing) {
    //     throw new ExpressError(400, "Send valid data for listing");
    // }
    let {id} = req.params;
    let updatedListing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    if(!updatedListing) {
        res.status(404).send("Listing not found.");
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
    
    // catch(err) {
    //     console.log(err);
    //     res.status(500).send("Failed to update the listing.");
    // }
    
}))

///DELETE ROUTE
router.delete("/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}))

module.exports = router;