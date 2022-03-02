const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.newReview = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user;
    campground.reviews.push(review);
    campground.save();
    review.save();
    req.flash('success', 'Review added successfully!');
    res.redirect(`/campgrounds/${id}`);
}
module.exports.deleteReview = async (req, res) => {
    const { id, rid } = req.params;
    await Review.findByIdAndDelete(rid);
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: rid } });
    req.flash('success', 'Review deleted successfully!');
    res.redirect(`/campgrounds/${id}`);
}