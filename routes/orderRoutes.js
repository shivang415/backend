const express =  require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { getUserOrders, createOrder, getOrderById } = require("../controllers/orderController");
const validate = require("../middleware/validate");
const orderSchema = require("../validators/orderValidators");

router.get("/my-orders", authMiddleware, getUserOrders);
router.post("/", authMiddleware, validate(orderSchema), createOrder);
router.get("/:id", authMiddleware, getOrderById);

module.exports = router;