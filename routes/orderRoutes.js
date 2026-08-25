const express =  require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { getUserOrders, createOrder, getOrderById } = require("../controllers/orderController");

router.get("/my-orders", authMiddleware, getUserOrders);
router.post("/", authMiddleware, createOrder);
router.get("/:id", authMiddleware, getOrderById);

module.exports = router;