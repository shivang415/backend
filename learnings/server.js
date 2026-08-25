const http = require("http");

const server = http.createServer((req,res) => { // request, response
    res.end("hello from my backend");
});

server.listen(5000, () => {
    console.log("server is running on port 5000");
});