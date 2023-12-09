import React, { useContext, useEffect } from "react";
import { css } from "@emotion/react";
import { Context } from "../../../context";
import {
    navBarWrapCss,
    titleCss,
    userListCss,
    directMsgCss,
} from "./SideBar.style";
import { BiChevronDown } from "react-icons/bi";
import { socketPrivate, socketGroup } from "../../../socket";
import { CURRENT_CHAT, GROUP_CHAT } from "../../../context/action";
import { User } from "../../index";

// 채팅할 수 있는 사용자 리스트와 그룹 채팅 리스트 조회
const SideBar = () => {
    const {
        state: { userList, loginInfo, currentChat, groupList },
        dispatch,
    } = useContext(Context);

    // 1보다 크면 그룹채팅
    useEffect(() => {
        if (currentChat.targetId.length > 1) {
            socketGroup.emit("msgInit", {
                targetId: currentChat.targetId,
            });
        } else {
            socketPrivate.emit("msgInit", {
                targetId: currentChat.targetId,
            });
        }
    }, [currentChat.targetId]);

    // 개인 채팅의 초대를 받게되면 실행된다.
    useEffect(() => {
        const setMsgAlert = (data) => {
            socketPrivate.emit("resJoinRoom", data.roomNumber);
        };
        socketPrivate.on("msg-alert", setMsgAlert);
        return () => {
            socketPrivate.off("msg-alert", setMsgAlert);
        };
    }, []);

    // 그룹방에 초대를 받으면 실행된다.
    useEffect(() => {
        const setGroupChat = (data) => {
            socketGroup.emit("resGroupJoinRoom", {
                roomNumber: data.roomNumber,
                socketId: data.socketId,
            });
        };
        socketGroup.on("group-chat-req", setGroupChat);
        return () => {
            socketGroup.off("group-chat-req", setGroupChat);
        };
    }, []);

    // 사이드바에 노출된 개인을 클릭시 실행된다.
    const onUserClickHandler = (e) => {
        const { id } = e.target.dataset;
        // 자신이 대화하고 있는 방에 정보를 전역 변수에 저장
        dispatch({
            type: CURRENT_CHAT,
            payload: {
                targetId: [id],
                roomNumber: `${loginInfo.userId}-${id}`,
                targetSocketId: e.target.dataset.socket,
            },
        });
        // 대화하고 싶은 상대에게 초대장을 보낸다.
        socketPrivate.emit("reqJoinRoom", {
            targetId: id,
            targetSocketId: e.target.dataset.socket,
        });
        dispatch({
            type: GROUP_CHAT,
            payload: {
                textBarStatus: false,
                groupChatNames: [],
            },
        });
    };

    const onMakeGroupChat = () => {
        dispatch({
            type: GROUP_CHAT,
            payload: {
                textBarStatus: true,
                groupChatNames: [],
            },
        });
    };

    // 그룹 채팅을 클릭하면 실행되는 함수
    const onGroupUserClickHandler = (e) => {
        const { id } = e.target.dataset;

        // 방번호가 ','를 이용한 문자열로 관리되므로 잘라서 배열로 관리
        dispatch({
            type: CURRENT_CHAT,
            payload: {
                targetId: [...id.split(",")],
                roomNumber: id,
                targetSocketId: e.target.dataset.socket,
            },
        });
        socketGroup.emit("joinGroupRoom", {
            roomNumber: id,
            socketId: e.target.dataset.socket,
        });
        dispatch({
            type: GROUP_CHAT,
            payload: {
                textBarStatus: false,
                groupChatNames: [],
            },
        });
    };

    return (
        <nav css={navBarWrapCss}>
            <div css={titleCss}> Slack </div>
            <ul css={userListCss}>
                <li css={directMsgCss} onClick={onMakeGroupChat}>
                    <BiChevronDown size="20" /> Direct Messages +
                </li>
                {userList.map((v, i) => (
                    <li key={`${i}-user`}>
                        <User
                            id={v.userId}
                            status={v.status}
                            socket={v.socketId}
                            type={v.type}
                            onClick={
                                v.type === "group"
                                    ? onGroupUserClickHandler
                                    : onUserClickHandler
                            }
                        />
                    </li>
                ))}
                {groupList.map((v, i) => (
                    <li key={`${i}-user`}>
                        <User
                            id={v.userId}
                            status={v.status}
                            socket={v.socketId}
                            type={v.type}
                            onClick={
                                v.type === "group"
                                    ? onGroupUserClickHandler
                                    : onUserClickHandler
                            }
                        />
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default SideBar;
