const express = require('express');
const router = express.Router();
const passport = require('passport');
const users_controller = require('../controllers/auth_controller');
const User = require('../models/user');
const catchAsync = require('../utilities/catchAsync');


router.get('/register', users_controller.registrationForm);

router.post('/register', catchAsync(users_controller.registerUser));

router.get('/login', users_controller.loginForm);

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users_controller.loginUser);

router.get('/logout', users_controller.logoutUser);

module.exports = router;