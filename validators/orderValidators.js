const Joi = require("joi");

const orderSchema = Joi.object({
    items: Joi.array().items(
        Joi.object({
            product_id: Joi.number().integer().positive().required(),
            quantity: Joi.number().integer().positive().required()
        })
    ).min(1).required()
});

module.exports = orderSchema;