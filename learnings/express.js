const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.send("Welcome to Rajeshwari Technomedia Backend");
});

app.get("/products", (req, res) => {
    res.send("Here are all the products");
});

app.get("/about", (req, res) => {
    res.send("About Rajeshwari Technomedia");
});

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});