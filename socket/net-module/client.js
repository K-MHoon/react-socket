const net = require("net");

const socket = net.connect({ port: 5000 });
socket.on("connect", () => {
    console.log("connected to server!");

    setInterval(() => {
        socket.write("Hello.");
    }, 1000);
});

socket.on("data", (chunk) => {
    console.log("From Server:" + chunk);
});

socket.on("end", () => {
    console.log("disconnected.");
});
socket.on("error", (err) => {
    console.log(err);
});
socket.on("timeout", () => {
    console.log("connection timeout.");
});
