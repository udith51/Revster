const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const CampgroundSchema = Schema({
    title: String,
    price: Number,
    image: String,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: Review
        }
    ]
});

const Campground = mongoose.model('Campground', CampgroundSchema);

module.exports = Campground;