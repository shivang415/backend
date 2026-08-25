const express = require("express");
const router = express.Router();

const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require("../controllers/productControllers");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware  = require("../middleware/roleMiddleware");

router.get("/", getProducts);

router.get("/:id", getProductById);

router.post("/", authMiddleware, roleMiddleware(["admin"]) , createProduct);

router.put("/:id", authMiddleware, updateProduct);

router.delete("/:id", authMiddleware, deleteProduct);

module.exports = router;