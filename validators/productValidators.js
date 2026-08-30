const Joi = require("joi");

const productSchema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().min(0).required()
});

module.exports = productSchema;