const express = require("express");

const app = express();
app.use(express.json()); // e batata hai Express ko ki incoming JSON data ko read kaise karna hai.

const productRoutes = require("./routes/productRoutes");
app.use("/products", productRoutes);
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);
const userRoutes = require("./routes/userRoutes");
app.use("/users", userRoutes);
const orderRoutes = require("./routes/orderRoutes");
app.use("/orders", orderRoutes);

app.use((req, res, next) => {
    console.log("Middleware executed");
    next();
});

app.listen(5000, () => {
    console.log("server is running on 5000");
});