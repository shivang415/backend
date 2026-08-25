const http = require("http");

const server = http.createServer((req,res) => {
    console.log("request received");
    console.log("URL:", req.url);
    console.log("Method:", req.method);

    res.end("req received by backend");
});

server.listen(5000, () => {
    console.log("server is running on port 5000");
});