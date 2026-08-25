const express = require("express");

const app = express();
app.use(express.json()); // e batata hai Express ko ki incoming JSON data ko read kaise karna hai.

app.use((req, res, next) => {
    console.log("Middleware executed");
    next();
});

app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        message: "Something went wrong"
    });
});

const products = [
    {
        id: 1,
        name: "wedding card",
        price: 50
    },
    {
        id: 2,
        name: "id card",
        price: 30
    },
    {
        id: 3,
        name: "business card",
        price: 100
    }
];

app.get("/", (req,res) => {
    res.send("welcome to homepage");
});

app.get("/products", (req, res) => {
    res.json(products);
});

app.get("/products/:id", (req, res) => {

    const id = Number(req.params.id);

    const product = products.find((p) => p.id === id);

    if (!product) {
        return res.status(404).json({
            message: "Product not found"
        });
    }

    res.json(product);
});

app.post("/products", (req, res) => {

    const product = req.body;

    products.push(product);

    res.status(201).json({
        message: "Product created successfully",
        product: product
    });

});

app.put("/products/:id", (req, res) => {

    const id = Number(req.params.id);

    const product = products.find((p) => p.id === id);

    if (!product) {
        return res.status(404).json({
            message: "Product not found"
        });
    }

    product.name = req.body.name;
    product.price = req.body.price;

    res.json({
        message: "Product updated successfully",
        product: product
    });
});

app.delete("/products/:id", (req, res) => {

    const id = Number(req.params.id);

    const productIndex = products.findIndex((p) => p.id === id);

    if (productIndex === -1) {
        return res.status(404).json({
            message: "Product not found"
        });
    }

    const deletedProduct = products.splice(productIndex, 1);

    res.json({
        message: "Product deleted successfully",
        product: deletedProduct[0]
    });
});

app.listen(5000, () => {
    console.log("server is running on 5000");
});