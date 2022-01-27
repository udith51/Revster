const Joi = require('joi');
module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required(),
    }).required()
})

//server side validation for title,price,...
//Can be done in app.js with if(!req.body.title), if(!req.body.price),... but very tedious