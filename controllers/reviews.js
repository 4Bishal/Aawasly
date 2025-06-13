const Listing = require("../models/listing");
const Review = require("../models/review");


module.exports.createReview = async (req, res, next) => {
    console.log(req.user);
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "New Review Added!");
    res.redirect(`/listing/${req.params.id}`);

    console.log("New review saved!");
};

module.exports.destroyReview = async (req, res, next) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");
    res.redirect(`/listing/${id}`);
};

