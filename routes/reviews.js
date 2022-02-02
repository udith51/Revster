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

router.post('/campgrounds/:id/reviews', validateReview_OnServer, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    campground.save();
    review.save();
    res.redirect(`/campgrounds/${id}`);
}))
router.delete('/campgrounds/:id/reviews/:rid', catchAsync(async (req, res) => {
    const { id, rid } = req.params;
    await Review.findByIdAndDelete(rid);
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: rid } });
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;