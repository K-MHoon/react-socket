const { Server } = require("socket.io");
const { posts } = require("./data");

const io = new Server("5000", {
    cors: {
        origin: "http://localhost:3000",
    },
});

let users = [];

const addNewUser = (userName, socketId) => {
    !users.some((user) => user.userName === userName) &&
        users.unshift({
            ...posts[Math.floor(Math.random() * 5)],
            userName,
            socketId,
        });
};

const getUser = (userName) => {
    return users.find((user) => user.userName === userName);
};

io.use((socket, next) => {
    const userName = socket.handshake.auth.userName;
    if (!userName) {
        console.log("err");
        return next(new Error("invalid userName"));
    }
    socket.userName = userName;
    next();
});

io.on("connection", (socket) => {
    addNewUser(socket.userName, socket.id);
    socket.on("userList", () => {
        io.sockets.emit("user-list", users);
    });
    socket.on("sendNotification", ({ senderName, receiverName, type }) => {
        const receiver = getUser(receiverName);
        console.log(receiver);
        io.to(receiver.socketId).emit("getNotification", {
            senderName,
            type,
        });
    });

    socket.on("disconnect", () => {
        console.log("logout");
    });
});
