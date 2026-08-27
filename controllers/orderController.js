const { application } = require("express");
const db = require("../config/db");
const AppError = require("../utils/AppError");

const getUserOrders = async (req, res, next) => {
    try{
        const userId = req.user.id;

        const sql = `
            SELECT 
                order_items.order_id,
                order_items.product_id,
                products.name,
                order_items.quantity,
                order_items.price,
                order_items.quantity * order_items.price AS total_price
            FROM order_items
            JOIN orders 
            ON order_items.order_id = orders.id
            JOIN products
            ON order_items.product_id = products.id
            WHERE orders.user_id = ?;
        `;

        const [results] = await db.query(sql, [userId]);
            
        res.json({
            results
        });
    }
    catch (err) {

        next(err);

    }
};

const createOrder = async (req, res, next) => {

    const { items } = req.body;

    const userId = req.user.id;

    // Check items
    if (!items || items.length === 0) {
        return next (
            new AppError("Items are required", 400)
        );
    }

    const connection = await db.getConnection();

    try{

        await connection.beginTransaction();

        // Step 1: Create order
        const orderSql = `
            INSERT INTO orders (user_id)
            VALUES (?)
        `;

        const [result] = await connection.query(orderSql, [userId]);

            // New order ki ID
            const orderId = result.insertId;

            // Step 2: Har item ko process karo
            for(const item of items){

                const { product_id, quantity } = item;

                // Product database mein hai ya nahi?
                const productSql =
                    "SELECT * FROM products WHERE id = ?";

                const [results] = await connection.query(productSql, [product_id]);

                        // Product nahi mila
                        if (results.length === 0) {
                            throw new AppError("Product not found", 404);
                        }

                        const product = results[0];

                        // Step 3: order_items mein insert
                        const itemSql = `
                            INSERT INTO order_items
                            (order_id, product_id, quantity, price)
                            VALUES (?, ?, ?, ?)
                        `;

                        await connection.query(
                            itemSql,
                            [
                                orderId,
                                product_id,
                                quantity,
                                product.price
                            ]
                        );
            }

            await connection.commit();

            res.status(201).json({
                message: "Order created successfully",
                orderId: orderId
            });

        }

        catch (err) {

            await connection.rollback();

            next(err);

        }

        finally {

            connection.release();

        }
};

const getOrderById = (req,res,next) => {

    const userId = req.user.id;

    const orderId = Number(req.params.id);

    const sql = `
        SELECT 
            order_items.order_id,
            order_items.product_id,
            products.name,
            order_items.quantity,
            order_items.price,
            order_items.quantity * order_items.price AS total_price
        FROM order_items
        JOIN orders 
        ON order_items.order_id = orders.id
        JOIN products 
        ON order_items.product_id = products.id
        WHERE orders.user_id = ?
        AND orders.id = ?;
    `;

    db.query(sql, [userId, orderId], (err, results) => {
        if (err) {
            return next(err);
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        const items = results.map(item => ({
            product_id: item.product_id,
            name: item.name,
            quantity: item.quantity,
            price: Number(item.price),
            total_price: Number(item.total_price)
        }));

        const total_amount = items.reduce((sum, item) => {
            return sum + Number(item.total_price);
        }, 0);

        res.json({
            order_id: orderId,
            items,
            TotalAmount: total_amount
        });
    });
};

module.exports = {
    getUserOrders,
    createOrder,
    getOrderById
};