import React, { useContext, useEffect } from "react";
import { css } from "@emotion/react";
import { Context } from "../../context";
import { socket, socketPrivate, socketGroup } from "../../socket";
import { AUTH_INFO, GROUP_LIST, USER_LIST } from "../../context/action";
import {
    mainContainerCss,
    slackMainCss,
    slackHeaderCss,
    slackWindowCss,
    mainContentCss,
} from "./MainContainer.style";
import { ChatRoom, SideBar } from "../../components";

const MainContainer = () => {
    const {
        state: { loginInfo },
        dispatch,
    } = useContext(Context);

    useEffect(() => {
        socket.on("connect", () => {
            dispatch({
                type: AUTH_INFO,
                payload: {
                    userId: socket.auth.userId,
                    socketId: socket.id,
                },
            });
        });
        return () => {
            socket.disconnect();
            socketPrivate.disconnect();
            socketGroup.disconnect();
        };
    }, []);

    useEffect(() => {
        const setUserListHandler = (data) => {
            dispatch({
                type: USER_LIST,
                payload: data || [],
            });
        };
        socket.on("user-list", setUserListHandler);
        return () => {
            socket.off("user-list", setUserListHandler);
        };
    }, []);

    useEffect(() => {
        const setGroupListHandler = (data) => {
            dispatch({
                type: GROUP_LIST,
                payload: data || [],
            });
        };
        socketGroup.on("group-list", setGroupListHandler);
        return () => {
            socketGroup.off("group-list", setGroupListHandler);
        };
    }, []);

    return (
        <div css={mainContainerCss}>
            <div css={slackMainCss}>
                <header css={slackHeaderCss}>
                    <ul css={slackWindowCss}>
                        <li className="red"></li>
                        <li className="orange"></li>
                        <li className="green"></li>
                    </ul>
                    <div className="user">{loginInfo.userId}</div>
                </header>
                <article css={mainContentCss}>
                    <SideBar />
                    <ChatRoom />
                </article>
            </div>
        </div>
    );
};

export default MainContainer;
