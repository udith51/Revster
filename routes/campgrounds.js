const express = require('express');
const router = express.Router();
const ExpressError = require('../utilities/ExpressError');
const catchAsync = require('../utilities/catchAsync');
const Campground = require('../models/campground');
const Review = require('../models/review');
const { campgroundSchema } = require('../joiSchemas')

const validateCampground_OnServer = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}//middleware
const isLoggedIn = (req, res, next) => {
    req.session.returnTo = req.originalUrl;
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be logged in');
        return res.redirect('/login');
    }
    next();
}
const isAuthor = async (req, res, next) => {
    const { id } = req.params;
    console.log(id);
    const campground = await Campground.findById(req.params.id);
    if (!campground.author.equals(req.user._id)) {
        console.log('Here');
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

router.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', { campgrounds });
}))
router.get('/campgrounds/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
})
router.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        })
        .populate('author');
    console.log(campground);
    if (!campground) {
        req.flash('error', 'No such campground present');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}))
router.post('/campgrounds', isLoggedIn, validateCampground_OnServer, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Campground added successfully!');
    res.redirect(`/campgrounds/${campground._id}`);
}))
router.get('/campgrounds/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params.id;
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'No such campground present');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}))
router.put('/campgrounds/:id', isLoggedIn, isAuthor, validateCampground_OnServer, catchAsync(async (req, res) => {
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { runValidators: true, new: true });
    req.flash('success', 'Campground updated successfully!');
    res.redirect(`/campgrounds/${campground._id}`);
}))
router.delete('/campgrounds/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    var ids = [];
    for (let revs of campground.reviews) {
        ids.push(revs.id);
    }
    await Review.deleteMany({ _id: { $in: ids } });
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground deleted successfully!');
    res.redirect(`/campgrounds`);
}))

module.exports = router;