const { PrivateRoom, PrivateMsg } = require("./schema/Private");

const privateMsg = (io) => {
    io.of("/private").use((socket, next) => {
        const userId = socket.handshake.auth.userId;
        if (!userId) {
            console.log("err");
            return next(new Error("invalid userId"));
        }
        socket.userId = userId;
        next();
    });

    io.of("/private").on("connection", (socket) => {
        // 과거 채팅 이력 가지고 옴
        socket.on("msgInit", async (res) => {
            const { targetId } = res;
            const userId = targetId[0];
            const privateRoom = await getRoomNumber(userId, socket.userId);
            if (!privateRoom) return;
            const msgList = await PrivateMsg.find({
                roomNumber: privateRoom._id,
            }).exec();
            io.of("/private")
                .to(privateRoom._id)
                .emit("private-msg-init", { msg: msgList });
        });

        // 메시지 전송 이벤트
        socket.on("privateMsg", async (res) => {
            const { msg, toUserId, time } = res;
            const privateRoom = await getRoomNumber(toUserId, socket.userId);
            if (!privateRoom) return;
            socket.broadcast.in(privateRoom._id).emit("private-msg", {
                msg: msg,
                toUserId: toUserId,
                fromUserId: socket.userId,
                time: time,
            });
            await createMsgDocument(privateRoom._id, res);
        });

        // 1:1 방 생성 + 상대방에게 방에 들어오라고 메시지 전송
        socket.on("reqJoinRoom", async (res) => {
            const { targetId, targetSocketId } = res;
            let privateRoom = await getRoomNumber(targetId, socket.userId);
            if (!privateRoom) {
                privateRoom = `${targetId}-${socket.userId}`;
                await findOrCreateRoomDocument(privateRoom);
            } else {
                privateRoom = privateRoom._id;
            }
            socket.join(privateRoom);
            io.of("private")
                .to(targetSocketId)
                .emit("msg-alert", { rootNumber: privateRoom });
        });

        // 자동 호출, 방에 입장
        socket.on("resJoinRoom", (res) => {
            socket.join(res);
        });
    });
};

// DB에 연결된 방 검색
// 시작 순서에 따라 생성된 방이 다를 수 있기 때문에 양 방향 조회
const getRoomNumber = async (fromId, toId) => {
    return (
        (await PrivateRoom.findById(`${fromId}-${toId}`)) ||
        (await PrivateRoom.findById(`${toId}-${fromId}`))
    );
};

// 방을 생성하는 역할 (기존 방이 있다면 바환)
const findOrCreateRoomDocument = async (room) => {
    if (room == null) return;
    const document = await PrivateRoom.findById(room);
    if (document) return document;
    return await PrivateRoom.create({
        _id: room,
    });
};

// 메시지 생성하는 역할
const createMsgDocument = async (roomNumber, res) => {
    if (roomNumber == null) return;

    return await PrivateMsg.create({
        roomNumber: roomNumber,
        msg: res.msg,
        toUserId: res.toUserId,
        fromUserId: res.fromUserId,
        time: res.time,
    });
};

module.exports.privateMsginit = privateMsg;
