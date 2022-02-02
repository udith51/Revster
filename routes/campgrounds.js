const express = require('express');
const router = express.Router();
const ExpressError = require('../utilities/ExpressError');
const catchAsync = require('../utilities/catchAsync');
const Campground = require('../models/campground');
const Review = require('../models/review');
const { campgroundSchema } = require('../joiSchemas')

const validateCampground_OnServer = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body);
    // console.log(;
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}//middleware

router.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', { campgrounds });
}))
router.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})
router.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if (!campground) {
        req.flash('error', 'No such campground present');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}))
router.post('/campgrounds', validateCampground_OnServer, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Campground added successfully!');
    res.redirect(`/campgrounds/${campground._id}`);
}))
router.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'No such campground present');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}))
router.put('/campgrounds/:id', validateCampground_OnServer, catchAsync(async (req, res) => {
    const campground = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground }, { runValidators: true, new: true });
    req.flash('success', 'Campground updated successfully!');
    res.redirect(`/campgrounds/${campground._id}`);
}))
router.delete('/campgrounds/:id', catchAsync(async (req, res) => {
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