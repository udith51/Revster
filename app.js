if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({ debug: true });
}
const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate')
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const MongoStore = require('connect-mongo');

const ExpressError = require('./utilities/ExpressError');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const authRoutes = require('./routes/auth');
const User = require('./models/user');

// const dbUrl = process.env.DB_URL;
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/Revster';
//Mongoose Connection
mongoose.connect(dbUrl)
    .then(() => console.log('Connected to database'))
    .catch((e) => console.log("Error", e))

app.engine('ejs', ejsMate);//to use boilerplate concept
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));//for ejs
app.use(express.urlencoded({ extended: true }));//for req.body
app.use(methodOverride('_method'));//for other form requests
app.use(express.static(path.join(__dirname, 'public')));//for serving static files
app.use(mongoSanitize({
    replaceWith: '_'
}))

const secret = process.env.SECRET || 'thisisasecret';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: secret
    },
    touchAfter: 24 * 60 * 60
})
store.on("error", function (e) {
    console.log('Session Store Error', e);
})

const sessionConfig = {
    store,
    name: 'session',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure:true,
        expies: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})
//Routes
app.use('/', authRoutes);
app.use('/', campgroundRoutes);
app.use('/', reviewRoutes);

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
const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(`Serving on port ${port}!`);
})


// express
// ejs-mate
// mongoose
// method-override
// Joi
// express-session
// passport
// passport-local
// passport-local-mongoose
// multer
// cloudinary
// multer-storage-cloudinary
// dotenv
// mapbox
// express-mongo-sanitize
// sanitize-html
// connect-mongo
// nodemon