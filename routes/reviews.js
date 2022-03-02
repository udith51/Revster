const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const Review = require('../models/review');
const reviews_controller = require('../controllers/reviews_controller')
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


router.post('/campgrounds/:id/reviews', isLoggedIn, validateReview_OnServer, catchAsync(reviews_controller.newReview))

router.delete('/campgrounds/:id/reviews/:rid', isLoggedIn, isRevAuthor, catchAsync(reviews_controller.deleteReview))

module.exports = router;