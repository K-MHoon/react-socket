const net = require("net");

const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        console.log("From client:", data.toString());
    });
    socket.on("close", () => {
        console.log("client disconnected.");
    });
    socket.write("welcome to server");
});

server.on("error", (err) => {
    console.log("err" + err);
});

server.listen(5000, () => {
    console.log("listening on 5000");
});
