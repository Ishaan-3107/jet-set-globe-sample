const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;
const users = require("./routes/user.js");
const posts = require("./routes/post.js");
const session = require("express-session");
const flash = require("connect-flash");
const path = require('path');

//EJS Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// app.use(cookieParser("secretcode"));

// app.get("/getcookies", (req, res) => {
//     res.cookie("greet", "namaste");
//     res.cookie("madeIn", "India");
//     res.send("Sent you some cookies");
// })


// app.get("/greet", (req, res) => {
//     let {name = "anonymous"} = req.cookies;
//     res.send(`Hello ${name}`);
// })

// app.get("/getsignedcookie", (req, res) => {
//     res.cookie("made-in", "India", {signed: true});
//     res.send("Signed cookie sent");
// })

// app.get("/verify", (req, res) => {
//     console.log(req.signedCookies);
//     res.send("Verified");
// })

let sessionOptions = {secret: "mysupersecretcode", resave: false, saveUninitialized: true};

app.use(session(sessionOptions));
app.use(flash());

// Start the server
app.listen(port, () => {
    console.log(`Server is listening to ${port}`);
});

//Middleware for flash message
app.use((req, res, next) => {
    res.locals.successMsg = req.flash("success");
    res.locals.errorMsg = req.flash("error");
    next();
})

// Basic route
app.get('/', (req, res) => {
    // console.log(req.cookies);
    res.send('This is the root');
});

app.get("/test", (req, res) => {
    res.send("Test successful!");
})

app.get("/reqcount", (req, res) => {
    if(req.session.count) {
        req.session.count++;
    }
    else {
        req.session.count = 1;
    }
    res.send(`You sent a request ${req.session.count} times`);
})

app.get("/register", (req, res) => {
    let {name = "anonymous"} = req.query;
    req.session.name = name;
    if(name == "anonymous") {
        req.flash("error", "User not registered");
    }
    else {
        req.flash("success", "user registered successfully"); //flash message appears only once for a session and disappears on refreshing the page
    }
    
    res.redirect("/hello");
})

app.get("/hello", (req, res) => {
    res.render("page.ejs", {name: req.session.name, msg: req.flash("success")});
})