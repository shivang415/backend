const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

const authMiddleware = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return next (
            new AppError("Access denied. No token Provided", 401)
        );
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (err) {
        return next (
            new AppError("Invalid or expired token", 401)
        );
    }
};

module.exports = authMiddleware;