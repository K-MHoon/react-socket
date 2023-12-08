import React, { useContext, useEffect, useRef, useState } from "react";
import { css } from "@emotion/react";
import { Context } from "../../../context";
import {
    chatRoomWrapCss,
    subTitleCss,
    chatBoxCss,
    chatBoxGuidCss,
    chatCss,
} from "./ChatRoom.style";
import { socketPrivate, socketGroup } from "../../../socket";
import logo from "../../../images/logo.png";
import dayjs from "dayjs";
import GroupTextInput from "../../groupTextInput/GroupTextInput";
import TextEditor from "../../textEditor/TextEditor";

const ChatRoom = () => {
    const {
        state: { currentChat, loginInfo, groupChat, userList },
    } = useContext(Context);
    const reactQuillRef = useRef(null);
    const [text, setText] = useState("");
    const [groupUser, setGroupUser] = useState("");
    const [msgList, setMsgList] = useState([]);
    const [groupChatUsers, setGroupChatUsers] = useState([]);

    // 1:1 대화한 메시지를 받는다.
    useEffect(() => {
        const setPrivateMsgListHandler = (data) => {
            const { msg, fromUserId, toUserId, time } = data;
            if (
                currentChat.roomNumber === `${fromUserId}-${toUserId}` ||
                currentChat.roomNumber === `${toUserId}-${fromUserId}`
            ) {
                setMsgList((prev) => [
                    ...prev,
                    { msg: msg, userId: fromUserId, time },
                ]);
            }
        };
        socketPrivate.on("private-msg", setPrivateMsgListHandler);
        return () => {
            socketPrivate.off("private-msg", setPrivateMsgListHandler);
        };
    }, [currentChat.roomNumber]);

    // 그룹 메시지를 불러온다.
    useEffect(() => {
        const setGroupMsgListHandler = (data) => {
            const { msg, toUserSocketId, fromUserId, time } = data;
            if (currentChat.roomNumber === toUserSocketId) {
                setMsgList((prev) => [
                    ...prev,
                    { msg: msg, userId: fromUserId, time },
                ]);
            }
        };
        socketGroup.on("group-msg", setGroupMsgListHandler);
        return () => {
            socketGroup.off("group-msg", setGroupMsgListHandler);
        };
    }, [currentChat.roomNumber]);

    // 처음 개인 대화방에 들어갈 때 과거에 대화했던 내역을 가지고 온다.
    useEffect(() => {
        const setMsgListInit = (data) => {
            setMsgList(
                data.msg.map((m) => ({
                    msg: m.msg,
                    userId: m.fromUserId,
                    time: m.time,
                }))
            );
        };
        socketPrivate.on("private-msg-init", setMsgListInit);
        return () => {
            socketPrivate.off("private-msg-init", setMsgListInit);
        };
    }, []);

    // 단체방에 들어갈 때 과거에 대화했던 내역을 불러온다.
    useEffect(() => {
        const setGroupMsgListInit = (data) => {
            setMsgList(
                data.msg.map((m) => ({
                    msg: m.msg,
                    userId: m.fromUserId,
                    time: m.time,
                }))
            );
        };
        socketGroup.on("group-msg-init", setGroupMsgListInit);
        return () => {
            socketGroup.off("group-msg-init", setGroupMsgListInit);
        };
    }, []);

    // 현재 방을 나가면 함수를 초기화한다.
    useEffect(() => {
        return () => {
            setMsgList([]);
        };
    }, [currentChat.roomNumber]);

    // 작성한 개인 메시지를 서버로 전송한다.
    const onPrivateMsgSendHandler = () => {
        const msg = reactQuillRef.current.unprivilegedEditor.getText();
        const currentTime = dayjs().format("HH:mm a");
        setMsgList((prev) => [
            ...prev,
            {
                msg: msg,
                userId: loginInfo.userId,
                time: currentTime,
            },
        ]);
        socketPrivate.emit("privateMsg", {
            msg: msg,
            toUserId: currentChat.targetId[0],
            toUserSocketId: currentChat.targetSocketId,
            fromUserId: loginInfo.userId,
            time: currentTime,
        });
        setText("");
    };

    // 그룹 대화에 초대할 사용자 리스트를 저장한다.
    const onGroupSendHandler = (e) => {
        e.preventDefault();
        if (!userList.filter((v) => v.userId === groupUser).length > 0) {
            alert("해당 사용자는 존재하지 않습니다.");
            setGroupUser("");
            return;
        }
        if (groupUser === loginInfo.userId) {
            alert("다른 사용자를 선택해주세요.");
            setGroupUser("");
            return;
        }
        setGroupChatUsers([...groupChatUsers, groupUser]);
        setGroupUser("");
    };

    const onChangeGroupTextHandler = (e) => {
        setGroupUser(e.target.value);
    };

    const groupChatUserCloseClick = (e) => {
        const { id } = e.target.dataset;
        setGroupChatUsers(groupChatUsers.filter((v) => v !== id));
    };

    // 해당하는 사용자에게 초대장이 발송된다.
    const onJoinClick = () => {
        if (groupChatUsers.length <= 0) return;
        const socketId = [...groupChatUsers, loginInfo.userId].join(",");
        const user = {
            socketId: socketId,
            status: true,
            userId: socketId,
            type: "group",
        };
        console.log(user);
        socketGroup.emit("reqGroupJoinRoom", user);
        setGroupChatUsers([]);
    };

    // 그룹 메시지를 작성한다.
    const onGroupMsgSendHandler = () => {
        const msg = reactQuillRef.current.unprivilegedEditor.getText();
        console.log(msg);
        const currentTime = dayjs().format("HH:mm a");
        setMsgList((prev) => [
            ...prev,
            {
                msg: msg,
                userId: loginInfo.userId,
                time: currentTime,
            },
        ]);
        socketGroup.emit("groupMsg", {
            toUserId: currentChat.targetSocketId,
            toUserSocketId: currentChat.targetSocketId,
            fromUserId: loginInfo.userId,
            msg: msg,
            time: currentTime,
        });
        setText("");
    };

    return (
        <article css={chatRoomWrapCss}>
            <div css={subTitleCss}>
                {groupChat.textBarStatus ? (
                    <GroupTextInput
                        groupText={groupUser}
                        onChangeGroupTextHandler={onChangeGroupTextHandler}
                        groupChatUserList={groupChatUsers}
                        onGroupSendHandler={onGroupSendHandler}
                        groupChatUserCloseClick={groupChatUserCloseClick}
                        onJoinClick={onJoinClick}
                    />
                ) : (
                    currentChat.targetId.map((v) => (
                        <span className="user">{v}</span>
                    ))
                )}
            </div>
            {currentChat.roomNumber ? (
                <ul css={chatBoxCss}>
                    {msgList.map((v, i) => (
                        <li css={chatCss} key={`${i}-chat`}>
                            <div className="userBox">
                                <span className="user">{v.userId}</span>
                                <span className="date">{v.time}</span>
                            </div>
                            <div className="textBox">{v.msg}</div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div css={chatBoxGuidCss}>
                    <img src={logo} width="100px" height="auto" alt="logo" />
                    <div className="guide">대화를 선택해주세요</div>
                </div>
            )}
            {currentChat.roomNumber && (
                <TextEditor
                    onSendHandler={
                        currentChat.targetId.length > 1
                            ? onGroupMsgSendHandler
                            : onPrivateMsgSendHandler
                    }
                    text={text}
                    reactQuillRef={reactQuillRef}
                    onChangeTextHandler={setText}
                />
            )}
        </article>
    );
};

export default ChatRoom;
