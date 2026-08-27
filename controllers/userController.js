const bcrypt = require("bcrypt");
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

const registerUser = async (req, res, next) => {

    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO users (name, email, password)
            VALUES (?, ?, ?)
        `;

        const [result] = await db.query(sql, [name, email, hashedPassword]);

                res.status(201).json({
                    message: "User registered successfully",
                    userId: result.insertId
                });

    } catch (err) {

        next(err);

    }
};

const loginUser = async (req, res, next) => {
    try{
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const sql = "SELECT * FROM users WHERE email = ?";

        const [results] = await db.query(sql, [email]);

            if (results.length === 0) {
                return next(
                    new AppError("Invalid email or password", 401)
                );
            }

            const user = results[0];

            const passwordMatch = await bcrypt.compare(
                password,
                user.password
            );

            if (!passwordMatch) {
                return next(
                    new AppError("Invalid email or password", 401)
                );
            }

            const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
            );

            res.json({
                message: "Login successful",
                token: token
            });
    }
    catch (err) {
        next(err);
    }
};

module.exports = {
    registerUser,
    loginUser
};