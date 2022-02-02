const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate')
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');

const ExpressError = require('./utilities/ExpressError');
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

//Mongoose Connection
mongoose.connect('mongodb://localhost:27017/Revster')
    .then(() => console.log('Connected to database'))
    .catch((e) => console.log("Error", e))

app.engine('ejs', ejsMate);//to use boilerplate concept
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));//for ejs
app.use(express.urlencoded({ extended: true }));//for req.body
app.use(methodOverride('_method'));//for other form requests
app.use(express.static(path.join(__dirname, 'public')));//for serving static files
const sessionConfig = {
    secret: 'thisisasecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expies: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());


app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})
//Routes
app.use('/', campgrounds);
app.use('/', reviews);

//Error handling
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


// express
// ejs-mate
// mongoose
// method-override
// Joi
// express-session
//
// nodemon