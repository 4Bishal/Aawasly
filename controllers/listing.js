const Listing = require("../models/listing");
const maptilerClient = require('@maptiler/client');
maptilerClient.config.apiKey = process.env.MAP_TOKEN;



module.exports.index = async (req, res, next) => {
    const allListing = await Listing.find({});
    res.render("listing/index.ejs", { allListing });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listing/new.ejs");
};

module.exports.showListing = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exists!");
        return res.redirect("/listing");
    }
    res.render("listing/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
    const response = await maptilerClient.geocoding.forward(req.body.listing.location, { limit: 1 });
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { filename, url };
    newListing.geometry = response.features[0].geometry;
    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New Listing Created!");
    res.redirect("/listing");
}

module.exports.renderEditForm = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exists!");
        return res.redirect("/listing");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listing/edit.ejs", { listing, originalImageUrl });
}

module.exports.updateListing = async (req, res, next) => {
    let { id } = req.params;
    console.log(req.body)
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    const response = await maptilerClient.geocoding.forward(req.body.listing.location, { limit: 1 });
    console.log(response)
    listing.geometry = response.features[0].geometry;
    console.log(listing);
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { filename, url };
        await listing.save();
    }
    await listing.save();
    req.flash("success", "Listing Updated!");
    res.redirect(`/listing/${id}`);
}

module.exports.destroyListing = async (req, res, next) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect(`/listing`);
}


module.exports.showFilteredListing = async (req, res) => {
    let { category } = req.query;
    const allListing = await Listing.find({});
    res.render("listing/filterListing.ejs", { category, allListing })
}

module.exports.showSerachedListing = async (req, res) => {
    let { destination } = req.body;
    const allListing = await Listing.find({});
    res.render("listing/searchListing.ejs", { destination, allListing })
}