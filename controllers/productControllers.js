const { json } = require("express");
const db = require("../config/db");

const getProducts = (req, res, next) => {

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
                return res.status(400).json({
                    message: "Invalid minPrice"
                });
            }

            if(maxPrice !== undefined && (Number.isNaN(maxPrice) || maxPrice < 0)){
                return res.status(400).json({
                    message: "Invalid maxPrice"
                });
            }

            if(minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice){
                return res.status(400).json({
                    message: "minPrice cannot be greater than maxPrice"
                });
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
            return res.status(400).json({
                message: "Invalid page or limit"
            });
        }

        if(limit > 100){
            return res.status(400).json({
                message: "Limit cannot be greater than 100"
            });
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

        db.query(countSql, values, (err, countResult) => {
            if(err){
                return next(err);
            }

            const totalProducts = Number(countResult[0].total);
            const totalPages = Math.ceil(totalProducts / limit);

            if(totalProducts === 0){
                return res.status(404).json({
                    message: "No products found"
                });
            }

            if(page > totalPages){
                return res.status(404).json({
                    message: "Page does not exist",
                    page: page,
                    totalPages: totalPages
                });
            }

            db.query(sql, [...values, limit, offset], (err, results) => {
                if(err){
                    return next(err);
                }

                const products = results.map(product => ({
                    productId: product.id,
                    productName: product.name,
                    productPrice: product.price
                }));

                const nextPage = page < totalPages;
                const previousPage = page > 1;

                res.json({
                    page: page,
                    limit: limit,
                    totalProducts: totalProducts,
                    totalPages: totalPages,
                    nextPage: nextPage,
                    previousPage: previousPage,
                    products: products
                });
            });
        }); 
    };

const getProductById = (req, res, next) => {

    const id = Number(req.params.id);

    if(Number.isNaN(id) || id <= 0){
        return res.status(400).json({
            message: "Invalid product id"
        });
    }

    const sql = `
        SELECT *
        FROM products
        WHERE id = ?;
    `;

    db.query(sql, [id], (err, results)=> {
        if(err){
            return next(err);
        }

        if(results.length === 0){
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            results
        });
    });
};

const createProduct = (req, res, next) => {

    const { name, price } = req.body;
    
    const productPrice = Number(req.body.price);

    if(!name || name.trim() === ""){
        return res.status(400).json({
            message: "Product name is required"
        });
    }

    if(Number.isNaN(productPrice) || productPrice < 0){
        return res.status(400).json({
            message: "Invalid Price"
        });
    }

    const sql = "INSERT INTO products (name, price) VALUES (?, ?)";
    
    db.query(sql, [name.trim(), productPrice], (err, result) => {

        if (err) {
            return next(err);
        }

        res.status(201).json({
            message: "Product created successfully",
            productId: result.insertId
        });
    });
};

const updateProduct = (req, res, next) => {
    const id = Number(req.params.id);
    const { name, price } = req.body;

    const productPrice = Number(req.body.price);

    if(Number.isNaN(id) || id <= 0){
        return res.status(400).json({
            message: "Invalid product id"
        });
    }

    if(!name || name.trim() === ""){
        return res.status(400).json({
            message: "Product name is required"
        });
    }

    if(Number.isNaN(productPrice) || productPrice < 0){
        return res.status(400).json({
            message: "Invalid Price"
        });
    }

    const sql = "UPDATE products SET name = ?, price = ? WHERE id = ?";

    db.query(sql, [name, price, id], (err, result) => {

        if (err) {
            return next(err);
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Product updated successfully"
        });
    });
}

const deleteProduct = (req, res, next) => {
    const id = Number(req.params.id);

    if(Number.isNaN(id) || id <= 0){
        return res.status(400).json({
            message: "Invalid id"
        });
    }

    const sql = "DELETE FROM products WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            return next(err);
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
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