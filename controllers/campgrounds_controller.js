const Campground = require('../models/campground');
const Review = require('../models/review');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
var geoCoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

module.exports.showall = async (req, res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', { campgrounds });
}

module.exports.newcamp_form = (req, res) => {
    res.render('campgrounds/new');
}
module.exports.camp_details = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        })
        .populate('author');
    if (!campground) {
        req.flash('error', 'No such campground present');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}
module.exports.createCampground = async (req, res, next) => {
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const im = [];
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    console.log(geoData.body.features[0].geometry);
    for (let f of req.files) {
        let temp = {
            url: f.path,
            filename: f.filename
        }
        im.push(temp);
    }
    campground.images = im;
    campground.author = req.user._id;
    // await campground.save();
    console.log(campground);
    req.flash('success', 'Campground added successfully!');
    res.redirect(`/campgrounds/${campground._id}`);
}
module.exports.editCampground = async (req, res) => {
    const { id } = req.params.id;
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'No such campground present');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}
module.exports.updateCampground = async (req, res) => {
    const im = [];
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground }, { runValidators: true, new: true });
    for (let f of req.files) {
        let temp = {
            url: f.path,
            filename: f.filename
        }
        im.push(temp);
    }
    campground.images.push(...im);
    await campground.save();
    if (req.body.deleteImages) {
        for (let f of req.body.deleteImages) {
            await cloudinary.uploader.destroy(f);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
        console.log(campground);
    }
    req.flash('success', 'Campground updated successfully!');
    res.redirect(`/campgrounds/${campground._id}`);
}
module.exports.deleteCampground = async (req, res) => {
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
}