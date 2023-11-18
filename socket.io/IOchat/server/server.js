const { Server } = require("socket.io");

const io = new Server("5000", {
    cors: {
        origin: "http://localhost:3000",
    },
});

// 전체 발송

/*

io.sockets.on("connection", (socket) => {
    socket.on("message", (data) => {
        io.sockets.emit("sMessage", data);
    });
    socket.on("login", (data) => {
        io.sockets.emit("sLogin", data);
    });
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});

*/

// Broadcast

io.sockets.on("connection", (socket) => {
    socket.on("message", (data) => {
        socket.broadcast.emit("sMessage", data);
    });
    socket.on("login", (data) => {
        socket.broadcast.emit("sLogin", data);
    });
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});
