const express = require("express");
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many login attempts. Please try again later."
    }
});

const router = express.Router();

const { registerUser, loginUser, refreshAccessToken } = require("../controllers/userController");
const validate = require("../middleware/validate");
const registerSchema = require("../validators/registerValidators");
const loginSchema = require("../validators/loginValidators");

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", loginLimiter, validate(loginSchema), loginUser);
router.post("/refresh", refreshAccessToken);

module.exports = router;