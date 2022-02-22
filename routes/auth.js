const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utilities/catchAsync')

router.get('/register', (req, res) => {
    res.render('auth/register');
})
router.post('/register', catchAsync(async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const newUser = new User({ email, username });
        await User.register(newUser, password);
        req.flash('success', 'Welcome to Yelpcamp!');
        res.redirect('/campgrounds');
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

module.exports = router;