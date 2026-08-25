const express = require("express");

const app = express();

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

app.listen(5000, () => {
    console.log("server is running on 5000");
});