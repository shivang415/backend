const http = require("http");

const server = http.createServer((req,res) => {
    if(req.url == "/"){
        res.end("welcome to homepage");
    }
    
    else if(req.url == "/products"){
        res.end("welcome to products");
    }

    else if(req.url == "/about"){
        res.end("welcome to about");
    }

    else{
        res.statusCode = 404;
        res.end("page not found");
    }
});

server.listen(5000, () => {
    console.log("server is running on port 5000");
});