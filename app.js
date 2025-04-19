const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js"); //To throw a custom Express error
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local"); //passport-local uses pbkdf2 hashing algorithm
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const app = express();
exports.app = app;

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

const sessionOptions = {
    secret: "mysupersecretcode", 
    resave: false, 
    saveUninitialized: true, 
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, //Expires after exactly one week
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize()); //To initialize passport
app.use(passport.session()); //Integrates Passport with Express sessions
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => { //Middleware for flash messages
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user; //req.user stores necessary info related to current user's session
    next();
})

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);
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


