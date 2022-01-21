const mongoose = require('mongoose');
const axios = require('axios');
const Campground = require('../models/campground');
const cities = require('./cities');
const { descriptors, places } = require('./seedhelpers');

mongoose.connect('mongodb://localhost:27017/Revster')
    .then(() => console.log('Connected to database'))
    .catch((e) => console.log("Error", e))

const sample = arr => arr[Math.floor(Math.random() * arr.length)]

const getPrice = () => { return ((Math.floor(Math.random() * 100) * 100) + 1000) }

const getImage = async () => {
    try {
        const data = await axios.get('https://api.unsplash.com/photos/random?client_id=1P06z6ltWTyFPfcUOVv1Pbc6e0imnSiXmmcYBCFsd_c&collections=2184453');
        return data.data.urls.small;
        // console.log(data.data.urls.small);
    }
    catch (e) {
        console.log(e);
    }
}


const seedDb = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            location: `${cities[random].city}-${cities[random].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: await getImage(),
            price: getPrice(),
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Odio aliquid aut, quibusdam facere doloribus atque sapiente possimus fugit nemo ex corrupti ab non nisi rerum fugiat maxime quisquam blanditiis quam.",
        })
        await camp.save();
    }
}
seedDb().then(() => mongoose.connection.close())