const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const catchAsync = require('../utilities/catchAsync');


router.get('/register', (req, res) => {
    res.render('auth/register');
})
router.post('/register', catchAsync(async (req, res) => {
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
}))
router.get('/login', (req, res) => {
    res.render('auth/login');
})
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'Welcome back!');
    if (req.session.returnTo) {
        const add = req.session.returnTo;
        delete req.session.returnTo;
        res.redirect(add);
    }
    else {
        res.redirect('/campgrounds');
    }

})
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/campgrounds');
})

module.exports = router;