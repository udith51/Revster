const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate')
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const Joi = require('joi');
const Campground = require('./models/campground');
const Review = require('./models/review');
const ExpressError = require('./utilities/ExpressError');
const catchAsync = require('./utilities/catchAsync');
const { campgroundSchema, reviewSchema } = require('./joiSchemas')


mongoose.connect('mongodb://localhost:27017/Revster')
    .then(() => console.log('Connected to database'))
    .catch((e) => console.log("Error", e))

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

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

app.get('/', (req, res) => {
    res.render('home');
})
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', { campgrounds });
}))
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campground });
}))
app.post('/campgrounds', validateCampground_OnServer, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}))
app.put('/campgrounds/:id', validateCampground_OnServer, catchAsync(async (req, res) => {
    const campground = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground }, { runValidators: true, new: true });
    res.redirect(`/campgrounds/${campground._id}`);
}))
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    var ids = [];
    for (let revs of campground.reviews) {
        ids.push(revs.id);
    }
    await Review.deleteMany({ _id: { $in: ids } });
    await Campground.findByIdAndDelete(id);
    res.redirect(`/campgrounds`);
}))
app.post('/campgrounds/:id/reviews', validateReview_OnServer, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    campground.save();
    review.save();
    res.redirect(`/campgrounds/${id}`);
}))
app.delete('/campgrounds/:id/reviews/:rid', catchAsync(async (req, res) => {
    const { id, rid } = req.params;
    await Review.findByIdAndDelete(rid);
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: rid } });
    res.redirect(`/campgrounds/${id}`);
}))


app.all('*', (req, res, next) => {
    next(new ExpressError("Page not found", 404));
})//for all req and for all url that is not matched

app.use((err, req, res, next) => {
    if (!err.status) {
        err.status = 500;
        err.message = "Something went wrong :("
    }
    res.status(err.status).render('error', { err });
})

app.listen(3000, () => {
    console.log('Serving on port 3000!');
})