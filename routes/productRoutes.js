const express = require("express");
const router = express.Router();

const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require("../controllers/productControllers");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware  = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const productSchema  = require("../validators/productValidators");

router.get("/", getProducts);

router.get("/:id", getProductById);

router.post("/", validate(productSchema), authMiddleware, roleMiddleware(["admin"]), createProduct);

router.put("/:id", authMiddleware, updateProduct);

router.delete("/:id", authMiddleware, deleteProduct);

module.exports = router;