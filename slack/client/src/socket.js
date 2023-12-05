import { io } from "socket.io-client";

export const socket = io("http://localhost:5000", {
    autoConnect: false,
});

// 네임스페이스 설정
export const socketPrivate = io("http://localhost:5000/private", {
    autoConnect: false,
});

export const socketGroup = io("http://localhost:5000/group", {
    autoConnect: false,
});
