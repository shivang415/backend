const express = require("express");

const router = express.Router();

const { registerUser, loginUser } = require("../controllers/userController");
const validate = require("../middleware/validate");
const registerSchema = require("../validators/registerValidators");
const loginSchema = require("../validators/loginValidators");

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);

module.exports = router;