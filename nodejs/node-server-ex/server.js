const http = require("http");
const fs = require("fs").promises;
const url = require("url");

const server = http
    .createServer(async (req, res) => {
        const pathname = url.parse(req.url).pathname;
        const method = req.method;
        let data = null;

        if (method == "GET") {
            switch (pathname) {
                case "/":
                    res.writeHead(200, {
                        "Content-Type": "text/html; charset=utf-8",
                    });
                    data = await fs.readFile("./index.html");
                    res.end(data);
                    break;
                default:
                    res.writeHead(400, {
                        "Content-Type": "text/html; charset=utf-8",
                    });
                    data = await fs.readFile("./index.html");
                    res.end(data);
            }
        }
    })
    .listen(8082);

server.on("listening", () => {
    console.log("8082 port is running");
});

server.on("error", (err) => {
    console.log(err);
});
