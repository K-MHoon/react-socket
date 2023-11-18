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

// Broadcast + Private

const clients = new Map();

io.sockets.on("connection", (socket) => {
    console.log("user connected");
    socket.on("message", (res) => {
        const { target } = res;
        const toUser = clients.get(target);
        target
            ? io.sockets.to(toUser).emit("sMessage", res)
            : socket.broadcast.emit("sMessage", res);
    });
    socket.on("login", (data) => {
        clients.set(data, socket.id);
        socket.broadcast.emit("sLogin", data);
    });
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});
