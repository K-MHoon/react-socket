import { io } from "socket.io-client";

export const socketGoods = io("http://localhost:5000/goods", {
    autoConnect: false,
});

export const socketUser = io("http://localhost:5000/user", {
    autoConnect: false,
});
