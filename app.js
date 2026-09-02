const express = require("express");
const app = express();
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const generalLimiter = rateLimit({
    windowMs: 15*60*1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyheaders: false,
    message: {
        success: false,
        message: "Too many requests, please try again later."
    }
});

app.use(generalLimiter);
app.use(
    cors({
        origin: "http://localhost:3000"
        // origin: "https://your-frontend-domain.com"
    })
);

const helmet = require("helmet");
app.use(helmet());

app.use(express.json()); // e batata hai Express ko ki incoming JSON data ko read kaise karna hai.

const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");

app.use((req, res, next) => {
    console.log("Middleware executed");
    next();
});

app.use("/products", productRoutes);
app.use("/users", userRoutes);
app.use("/orders", orderRoutes);

const errorHandler = require("./middleware/errorHandler");
const { message } = require("./validators/productValidators");
app.use(errorHandler);

app.listen(5000, () => {
    console.log("server is running on 5000");
});