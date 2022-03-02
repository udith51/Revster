const Campground = require('../models/campground');
const Review = require('../models/review');

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
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
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
    const campground = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground }, { runValidators: true, new: true });
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



