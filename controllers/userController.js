const bcrypt = require("bcrypt");
const crypto = require("crypto");
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError"); 

const refreshAccessToken = async (req, res, next) => {
        const { refreshToken } = req.body;

        if(!refreshToken) {
            return next(
                new AppError("Refresh token is required", 400)
            );
        }

        const tokenHash = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");

        const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const sql = `SELECT *
                    FROM refresh_tokens
                    WHERE token_hash = ?
                    `;

        const [results] = await connection.query(sql,[tokenHash]);

        if(results.length === 0) {
                throw new AppError("Invalid refresh token", 401)
        }

        const storedToken = results[0];

        if (storedToken.revoked_at) { // storedToken.revoked_at !== null aise v likh skte hain

            await connection.query(
                `UPDATE refresh_tokens
                SET revoked_at = NOW()
                WHERE family_id = ?
                AND revoked_at IS NULL`,
                [storedToken.family_id]
            )

            return next(
               new AppError("Refresh token reuse detected", 401)
            );
        }

        if(new Date(storedToken.expires_at) < new Date()) { // db wali expiry dateTime < current dateTime
                throw new AppError("Refresh token has expired", 401)
        }

        const userSql = ` SELECT id, email, role
                          FROM users
                          WHERE id = ?;
                        `;

        const [userResults] = await connection.query(userSql, [storedToken.user_id]);

        if (userResults.length === 0) {
            throw new AppError("User not found", 404)
        }

        const user = userResults[0];

        await connection.query(
            `UPDATE refresh_tokens
            SET revoked_at = NOW()
            WHERE id = ?`,
            [storedToken.id]
        );

        const newRefreshToken = crypto
            .randomBytes(64)
            .toString("hex");

        const newTokenHash = crypto
            .createHash("sha256")
            .update(newRefreshToken)
            .digest("hex");

        const expiresAt = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        );

        await connection.query(
            `INSERT INTO refresh_tokens
            (user_id, token_hash, expires_at, family_id)
            VALUES (?, ?, ?, ?)`,
            [
                storedToken.user_id,
                newTokenHash,
                expiresAt,
                storedToken.family_id
            ]
        );

        const newAccessToken = jwt.sign(
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

        await connection.commit();

        res.json({
            message: "Access token refreshed successfully",
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });

    } catch (err) {
        await connection.rollback();
        next(err);
    
    } finally {
        connection.release();
    }
}

const registerUser = async (req, res, next) => {

    try {
        const { name, email, password } = req.body;

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
    try {
        const { email, password } = req.body;

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

        // 1. Generate Access Token
        const accessToken = jwt.sign(
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

        // 2. Generate Refresh Token
        const refreshToken = crypto.randomBytes(64).toString("hex");

        // 3. Hash Refresh Token
        const tokenHash = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");

        // 4. Refresh Token expiry
        const expiresAt = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        );

        const familyId = crypto.randomUUID();

        // 5. Save hashed refresh token in DB
        const refreshSql = `
            INSERT INTO refresh_tokens
            (user_id, token_hash, expires_at, family_id)
            VALUES (?, ?, ?, ?)
        `;

        await db.query(refreshSql, [
            user.id,
            tokenHash,
            expiresAt,
            familyId
        ]);

        // 6. Send tokens to client
        res.json({
            message: "Login successful",
            accessToken: accessToken,
            refreshToken: refreshToken
        });

    } catch (err) {
        next(err);
    }
};

const logoutUser = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return next(
                new AppError("Refresh token is required", 400)
            );
        }

        const tokenHash = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");

        const sql = `
            UPDATE refresh_tokens
            SET revoked_at = NOW()
            WHERE token_hash = ?
        `;

        const [result] = await db.query(sql, [tokenHash]);

        if (result.affectedRows === 0) {
            return next(
                new AppError("Invalid refresh token", 401)
            );
        }

        res.json({
            message: "Logout successful"
        });

    } catch (err) {
        next(err);
    }
};

module.exports = {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser
};