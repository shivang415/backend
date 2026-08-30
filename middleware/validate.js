const validate = (schema) => {
    return (req, res, next) => {
        const result = schema.validate(req.body, {
            abortEarly: false
        });

        if(result.error) {

            const errors = result.error.details.map(
                (detail) => detail.message
            );

            return res.status(400).json({
                errors: errors
            });
            
        }

        next();
    }
};

module.exports = validate;