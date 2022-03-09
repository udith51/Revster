const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });
const campgrounds_controller = require('../controllers/campgrounds_controller');
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

router.get('/campgrounds', catchAsync(campgrounds_controller.showall));

router.get('/campgrounds/new', isLoggedIn, campgrounds_controller.newcamp_form);

router.get('/campgrounds/:id', catchAsync(campgrounds_controller.camp_details));

// router.post('/campgrounds', isLoggedIn, validateCampground_OnServer, catchAsync(campgrounds_controller.createCampground));
router.post('/campgrounds', upload.array('image'), (req, res) => {
    console.log(req.body, req.files);
    res.send("It worked!");
})

router.get('/campgrounds/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds_controller.editCampground));

router.put('/campgrounds/:id', isLoggedIn, isAuthor, validateCampground_OnServer, catchAsync(campgrounds_controller.updateCampground));

router.delete('/campgrounds/:id', isLoggedIn, isAuthor, (campgrounds_controller.deleteCampground))

module.exports = router;