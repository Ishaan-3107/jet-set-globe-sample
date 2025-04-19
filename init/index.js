const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js");

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

let initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj, owner: "6801df8861c32e0fe0572946"}))
    await Listing.insertMany(initData.data);

    console.log("Data was initialized.");
}

initDB();