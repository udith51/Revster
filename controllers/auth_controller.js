const User = require('../models/user');
const passport = require('passport');

module.exports.homePage = (req, res) => {
    res.render('home');
}

module.exports.registrationForm = (req, res) => {
    res.render('auth/register');
}

module.exports.registerUser = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const newUser = new User({ email, username });
        const regUser = await User.register(newUser, password);
        req.login(regUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelpcamp!');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        if (e.code == 11000) {
            req.flash('error', ' A user with the given email id is already registered');
            res.redirect('/register');
        }
        else {
            req.flash('error', e.message);
            res.redirect('/register');
        }
    }
}

module.exports.loginForm = (req, res) => {
    res.render('auth/login');
}

module.exports.loginUser = (req, res) => {
    req.flash('success', 'Welcome back!');
    if (req.session.returnTo) {
        const add = req.session.returnTo;
        delete req.session.returnTo;
        res.redirect(add);
    }
    else {
        res.redirect('/campgrounds');
    }
}

module.exports.logoutUser = (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/campgrounds');
}
