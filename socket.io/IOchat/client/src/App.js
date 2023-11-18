import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import logo from "./images/iologo.png";
import "./App.css";

const webScocket = io("http://localhost:5000");

const App = () => {
    const messagesEndRef = useRef(null);
    const [userId, setUserId] = useState("");
    const [isLogin, setIsLogin] = useState(false);
    const [msg, setMsg] = useState("");
    const [msgList, setMsgList] = useState([]);

    useEffect(() => {
        if (!webScocket) return;
        const sMessageCallback = (msg) => {
            const { data, id } = msg;
            setMsgList((prev) => [
                ...prev,
                {
                    msg: data,
                    type: "other",
                    id: id,
                },
            ]);
        };
        webScocket.on("sMessage", sMessageCallback);
        return () => {
            webScocket.off("sMessage", sMessageCallback);
        };
    }, []);

    useEffect(() => {
        if (!webScocket) return;
        const sLoginCallback = (msg) => {
            setMsgList((prev) => [
                ...prev,
                {
                    msg: `${msg} joins the chat`,
                    type: "welcome",
                    id: "",
                },
            ]);
        };
        webScocket.on("sLogin", sLoginCallback);
        return () => {
            webScocket.off("sLogin", sLoginCallback);
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [msgList]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const onSubmitHandler = (e) => {
        e.preventDefault();
        webScocket.emit("login", userId);
        setIsLogin(true);
    };

    const onChangeUserIdHandler = (e) => {
        setUserId(e.target.value);
    };

    const onSendSubmitHandler = (e) => {
        e.preventDefault();
        const sendData = {
            data: msg,
            id: userId,
        };
        webScocket.emit("message", sendData);
        setMsgList((prev) => [...prev, { msg: msg, type: "me", id: userId }]);
        setMsg("");
    };

    const onChangeMsgHandler = (e) => {
        setMsg(e.target.value);
    };

    return (
        <div className="app-container">
            <div className="wrap">
                {isLogin ? (
                    <div className="chat-box">
                        <h3>Login as a "{userId}"</h3>
                        <ul className="chat">
                            {msgList.map((v, i) =>
                                v.type === "welcome" ? (
                                    <li className="welcome">
                                        <div className="line"></div>
                                        <div>{v.msg}</div>
                                        <div className="line"></div>
                                    </li>
                                ) : (
                                    <li className={v.type} key={`${i}_li`}>
                                        <div className="userId">{v.id}</div>
                                        <div className={v.type}>{v.msg}</div>
                                    </li>
                                )
                            )}
                            <li ref={messagesEndRef}></li>
                        </ul>
                        <form
                            className="send-form"
                            onSubmit={onSendSubmitHandler}
                        >
                            <input
                                placeholder="Enter your message"
                                onChange={onChangeMsgHandler}
                                value={msg}
                            />
                            <button type="submit">send</button>
                        </form>
                    </div>
                ) : (
                    <div className="login-box">
                        <div className="login-title">
                            <img
                                src={logo}
                                width="40px"
                                height="40px"
                                alt="logo"
                            />
                            <div>IOChat</div>
                        </div>
                        <form className="login-form" onSubmit={onSubmitHandler}>
                            <input
                                placeholder="Enter your ID"
                                onChange={onChangeUserIdHandler}
                                value={userId}
                            />
                            <button type="submit">Login</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;
