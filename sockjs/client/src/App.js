import React, { useEffect, useRef, useState } from "react";
import sockLogo from "./images/sockjs.png";
import SockJS from "sockjs-client";
import "./App.css";

const App = () => {
    const sockJs = useRef(null);
    const messagesEndRef = useRef(null);
    const [userId, setUserId] = useState("");
    const [isLogin, setIsLogin] = useState(false);
    const [msg, setMsg] = useState("");
    const [msgList, setMsgList] = useState([]);

    useEffect(() => {
        sockJs.current = new SockJS("http://localhost:9999/sock");
    }, []);

    useEffect(() => {
        if (!sockJs.current) return;

        // 최초 연결시 실행
        sockJs.current.onopen = () => {
            console.log("open", sockJs.current.protocol);
        };

        // 서버 메시지 받는 역할
        sockJs.current.onmessage = (e) => {
            const { data, id } = JSON.parse(e.data);
            setMsgList((prev) => [
                ...prev,
                { msg: data, type: "other", id: id },
            ]);
        };

        // 소켓의 연결이 끊기면 실행
        sockJs.current.onclose = () => {
            console.log("close");
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
        const sendData = {
            type: "id",
            data: userId,
        };
        sockJs.current.send(JSON.stringify(sendData));
        setIsLogin(true);
    };

    const onChangeUserIdHandler = (e) => {
        setUserId(e.target.value);
    };

    const onSendSubmitHandler = (e) => {
        e.preventDefault();
        const sendData = {
            type: "msg",
            data: msg,
            id: userId,
        };
        sockJs.current.send(JSON.stringify(sendData));
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
                            {msgList.map((v, i) => (
                                <li className={v.type} key={`${i}_li`}>
                                    <div className="userId">{v.id}</div>
                                    <div className={v.type}>{v.msg}</div>
                                </li>
                            ))}
                            <li ref={messagesEndRef} />
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
                        <h1 className="login-title">
                            <img
                                src={sockLogo}
                                width="30px"
                                height="auto"
                                alt="logo"
                            />
                            SockChat
                        </h1>
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
