const { GroupUserList, GroupRoom, GroupMsg } = require("./schema/Group");

const groupMsg = (io) => {
    io.of("/group").use(async (socket, next) => {
        const userId = socket.handshake.auth.userId;
        if (!userId) {
            console.log("err");
            return next(new Error("invalid userId"));
        }
        socket.userId = userId;
        await createGroupUser(userId, socket.id);
        next();
    });

    io.of("/group").on("connection", async (socket) => {
        const groupRoom = await GroupRoom.find({
            loginUserId: socket.userId,
        }).exec();

        socket.emit("group-list", groupRoom);

        // 처음 입장시 과거 대화 내역을 가지고 온다.
        socket.on("msgInit", async (res) => {
            const { targetId } = res;

            let roomName = null;
            roomName = targetId.join(",");
            const groupMsg = await GroupMsg.find({
                roomNumber: roomName,
            }).exec();
            io.of("/group")
                .to(roomName)
                .emit("group-msg-init", { msg: groupMsg || [] });
        });

        // 참여한 모든 사용자에게 초대 메시지 전송하는 이벤트
        socket.on("reqGroupJoinRoom", async (res) => {
            const { socketId } = res;
            const groupUser = await GroupUserList.find()
                .where("userId")
                .in(socketId.split(","));
            groupUser.forEach((v) => {
                io.of("/group").to(v.socketId).emit("group-chat-req", {
                    roomNumber: socketId,
                    socketId: v.socketId,
                    userId: socket.userId,
                });
            });
        });

        // 메시지 전송 및 저장하는 이벤트
        socket.on("groupMsg", async (res) => {
            const { msg, toUserSocketId, toUserId, fromUserId, time } = res;
            socket.broadcast.in(toUserSocketId).emit("group-msg", {
                msg: msg,
                toUserId,
                fromUserId,
                toUserSocketId: toUserSocketId,
                time: time,
            });
            await createMsgDocument(toUserSocketId, res);
        });

        // 다른 대화하다가 다시 그룹 방에 들어온 경우,
        socket.on("joinGroupRoom", (res) => {
            const { roomNumber } = res;
            socket.join(roomNumber);
        });

        // 초대받은 사용자가 방에 들어가기 위한 기능
        socket.on("resGroupJoinRoom", async (res) => {
            const { roomNumber, socketId } = res;
            socket.join(roomNumber);
            await createGroupRoom(socket.userId, roomNumber, roomNumber);

            const groupRoom = await GroupRoom.find({
                loginUserId: socket.userId,
            }).exec();
            io.of("/group").to(socketId).emit("group-list", groupRoom);
        });
    });
};

const createGroupRoom = async (loginUserId, userId, socketId) => {
    if (loginUserId == null) return;
    return await GroupRoom.create({
        loginUserId: loginUserId,
        status: true,
        userId: userId,
        socketId: socketId,
        type: "group",
    });
};

const createGroupUser = async (userId, socketId) => {
    if (userId == null) return;
    const document = await GroupUserList.findOneAndUpdate(
        { userId: userId },
        { socketId: socketId }
    );
    if (document) return document;

    return await GroupUserList.create({
        status: true,
        userId: userId,
        socketId: socketId,
    });
};

const createMsgDocument = async (roomNumber, res) => {
    if (roomNumber == null) return;

    return await GroupMsg.create({
        roomNumber: roomNumber,
        msg: res.msg,
        toUserId: res.toUserId,
        fromUserId: res.fromUserId,
        time: res.time,
    });
};

module.exports.groupMsginit = groupMsg;
