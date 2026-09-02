const { json } = require("express");
const db = require("../config/db");
const AppError = require("../utils/AppError");
const sendResponse = require("../utils/sendResponse");

const getProducts = async (req, res, next) => {

    try{

        const page = req.query.page !== undefined
            ? Number(req.query.page)
            : 1;

        const limit = req.query.limit !== undefined
            ? Number(req.query.limit)
            : 5;

        const search = req.query.search || "";
        const category = req.query.category || "";

        const minPrice = req.query.minPrice !== undefined
            ? Number(req.query.minPrice)
            : undefined;

        const maxPrice = req.query.maxPrice !== undefined
            ? Number(req.query.maxPrice)
            : undefined;

            if(minPrice !== undefined && (Number.isNaN(minPrice) || minPrice < 0)){
                return next(
                    new AppError("Invalid minPrice", 400)
                );
            }

            if(maxPrice !== undefined && (Number.isNaN(maxPrice) || maxPrice < 0)){
                return next(
                    new AppError("Invalid maxPrice", 400)
                );
            }

            if(minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice){
                return next(
                    new AppError("minPrice cannot be greater than maxPrice", 400)
                );
            }

        const conditions = ["name like ?"];

        const values = [`%${search}%`];

        if(category !== ""){
            conditions.push("category = ?");
            values.push(category);
        }

        if(minPrice !== undefined){
            conditions.push("price >= ?");
            values.push(minPrice);
        }

        if(maxPrice !== undefined){
            conditions.push("price <= ?");
            values.push(maxPrice);
        }

        const whereClause = conditions.join(" AND ");

        const sort = req.query.sort || "id";

        const allowedSort = {  // left side = user input, right side = sql column
            id: "id",
            name: "name",
            price: "price"
        };

        const sortColumn = allowedSort[sort] || "id";
        const order = req.query.order === "desc" ? "DESC" : "ASC";

        if(
            Number.isNaN(page) ||
            Number.isNaN(limit) ||
            page <= 0 ||
            limit <= 0
        ){
            return next(
                new AppError("Invalid page or limit", 400)
            );
        }

        if(limit > 100){
            return next(
                new AppError("limit cannot be greater than 100", 400)
            );
        }

        const offset = (page - 1) * limit;

        // ? = SQL me data/value insert karna.
        // ${} = query ka SQL structure/identifier dynamically banana — lekin user input ko direct mat daalna; whitelist karo.
        const sql = `
            SELECT *
            FROM products
            WHERE ${whereClause}
            ORDER BY ${sortColumn} ${order}
            LIMIT ? OFFSET ?;
        `;

        const countSql = `
            SELECT COUNT(*) AS total
            FROM products
            WHERE ${whereClause};
        `;

        const [countResult] = await db.query(countSql, values); 

            const totalProducts = Number(countResult[0].total);
            const totalPages = Math.ceil(totalProducts / limit);

            if(totalProducts === 0){
                return next(
                new AppError("No products found", 404)
            );
            }

            if(page > totalPages){
                return next (
                    new AppError(`page ${page} does not exist. Total pages: ${totalPages}`, 404)
                );
            }

            const [results] = await db.query(sql, [...values, limit, offset]);

                const products = results.map(product => ({
                    id: product.id,
                    name: product.name,
                    price: Number(product.price)
                }));

                const nextPage = page < totalPages;
                const previousPage = page > 1;

                sendResponse(
                    res,
                    200,
                    "Products fetched successfully",
                    {
                        page,
                        limit,
                        totalProducts,
                        totalPages,
                        nextPage,
                        previousPage,
                        products
                    }
                );

    } catch (err) {

        next(err);

    }
};

const getProductById = async (req, res, next) => {

    try {

        const id = Number(req.params.id);

        if(Number.isNaN(id) || id <= 0){
            return next(
                new AppError("Invalid product id", 400)
            );
        }

        const sql = `
            SELECT *
            FROM products
            WHERE id = ?;
        `;

        const [result] = await db.query(sql, [id]);

        if(result.length === 0){
            return next(
                new AppError("Product not found", 404)
            );
        }

        sendResponse(
            res,
            200,
            "Product fetched successfully",
            result[0]
        )

    } catch (err) {

        next(err);

    }

};

const createProduct = async (req, res, next) => {

    try{

        const { name, price } = req.body;
        
        const productPrice = Number(req.body.price);

        const sql = "INSERT INTO products (name, price) VALUES (?, ?)";
        
        const [result] = await db.query(sql, [name.trim(), productPrice],);

            sendResponse(
                res,
                201,
                "Product created successfully",
                result
            );

    }

    catch (err) {

        next(err);

    }
};

const updateProduct = (req, res, next) => {
    const id = Number(req.params.id);
    const { name, price } = req.body;

    const productPrice = Number(req.body.price);

    if(Number.isNaN(id) || id <= 0){
        return next(
            new AppError("Invalid product id", 400)
        );
    }

    if(!name || name.trim() === ""){
        return next(
            new AppError("Product name is required", 400)
        );
    }

    if(Number.isNaN(productPrice) || productPrice < 0){
        return next(
            new AppError("Invalid price", 400)
        );
    }

    const sql = "UPDATE products SET name = ?, price = ? WHERE id = ?";

    db.query(sql, [name, price, id], (err, result) => {

        if (err) {
            return next(err);
        }

        if (result.affectedRows === 0) {
            return next(
            new AppError("Product not found", 404)
        );
        }

        res.json({
            message: "Product updated successfully"
        });
    });
}

const deleteProduct = (req, res, next) => {
    const id = Number(req.params.id);

    if(Number.isNaN(id) || id <= 0){
        return next(
            new AppError("Invalid id", 400)
        );
    }

    const sql = "DELETE FROM products WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            return next(err);
        }

        if (result.affectedRows === 0) {
            return next(
            new AppError("Product not found", 404)
        );
        }

        res.json({
            message: "Product deleted successfully"
        });
    });
}

module.exports = {
    getProducts, 
    getProductById,
    createProduct, 
    updateProduct,
    deleteProduct
};