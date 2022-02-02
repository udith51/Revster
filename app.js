const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate')
const mongoose = require('mongoose');
const methodOverride = require('method-override');
// const Joi = require('joi');
// const Campground = require('./models/campground');
// const Review = require('./models/review');
const ExpressError = require('./utilities/ExpressError');
// const catchAsync = require('./utilities/catchAsync');
// const { campgroundSchema, reviewSchema } = require('./joiSchemas');
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');


mongoose.connect('mongodb://localhost:27017/Revster')
    .then(() => console.log('Connected to database'))
    .catch((e) => console.log("Error", e))

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


app.use('/', campgrounds);
app.use('/', reviews);


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