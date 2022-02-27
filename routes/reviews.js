const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const Review = require('../models/review');
const ExpressError = require('../utilities/ExpressError');
const catchAsync = require('../utilities/catchAsync');
const { reviewSchema } = require('../joiSchemas');

const validateReview_OnServer = ((req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
})
const isLoggedIn = (req, res, next) => {
    req.session.returnTo = req.originalUrl;
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be logged in');
        return res.redirect('/login');
    }
    next();
}
const isRevAuthor = async (req, res, next) => {
    const { rid, id } = req.params;
    console.log(rid);
    const review = await Review.findById(rid);
    if (!review.author.equals(req.user._id)) {
        console.log('Here');
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}


router.post('/campgrounds/:id/reviews', isLoggedIn, validateReview_OnServer, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user;
    campground.reviews.push(review);
    campground.save();
    review.save();
    req.flash('success', 'Review added successfully!');
    res.redirect(`/campgrounds/${id}`);
}))
router.delete('/campgrounds/:id/reviews/:rid', isLoggedIn, isRevAuthor, catchAsync(async (req, res) => {
    const { id, rid } = req.params;
    await Review.findByIdAndDelete(rid);
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: rid } });
    req.flash('success', 'Review deleted successfully!');
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;