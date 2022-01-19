const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { descriptors, places } = require('./seedhelpers');

mongoose.connect('mongodb://localhost:27017/Revster')
    .then(() => console.log('Connected to database'))
    .catch((e) => console.log("Error", e))

const sample = arr => arr[Math.floor(Math.random() * arr.length)]

const seedDb = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            location: `${cities[random].city}-${cities[random].state}`,
            title: `${sample(descriptors)} ${sample(places)}`
        })
        await camp.save();
    }
}
seedDb().then(() => mongoose.connection.close())