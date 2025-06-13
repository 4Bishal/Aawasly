const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const maptilerClient = require('@maptiler/client');

maptilerClient.config.apiKey = process.env.MAP_TOKEN;



const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";



main()
    .then((result) => {
        console.log(`Connection Succesful!`);
    })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect(MONGO_URL);
}


const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({ ...obj, owner: "6842af46f242881c9bb7b213" }));
    initData.data = initData.data.map((obj) => ({ ...obj, geometry: { type: "Point" } }));
    for (data of initData.data) {
        const response = await maptilerClient.geocoding.forward(data.location, { limit: 1 });
        data.geometry = response.features[0].geometry;
    }
    console.log(initData)
    await Listing.insertMany(initData.data);
    console.log("Data was initialized");
}

initDB();


// const response = await maptilerClient.geocoding.forward(req.body.listing.location, { limit: 1 });
// newListing.geometry = response.features[0].geometry;