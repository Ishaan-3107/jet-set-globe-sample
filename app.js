const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js"); //To throw a custom Express error

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

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

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);

//Routes
app.get("/", (req, res) => {
    res.send("This is the root!");
})

app.all("*", (res, req, next) => {
    next(new ExpressError(404, "Page not found!"));
})

app.use((err, req, res, next) => {
    let {statusCode=500, message="Something went wrong!"} = err; //Extracting statusCode and message fields from err
    // res.status(statusCode).send(message);
    res.status(statusCode).render("listings/error.ejs", {err});
})


