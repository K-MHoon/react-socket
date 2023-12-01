import { debounce } from "lodash-es";
import { socket } from "../../socket";
import React from "react";
import { useRef } from "react";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";
import TextEditor from "../../components/textEditor/TextEditor";

const cursorMap = new Map();
const cursorColor = [
    "#FF0000",
    "#FF5E00",
    "#FFBB00",
    "#FFE400",
    "#ABF200",
    "#1DDB16",
    "#00D8FF",
    "#0054FF",
];

const EditorContainer = () => {
    const timerRef = useRef(null);
    const cursorRef = useRef(null);
    const reactQuillRef = useRef(null);
    const { id: documentId } = useParams();
    const [text, setText] = useState("");

    useEffect(() => {
        socket.emit("join", documentId);
        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        socket.once("initDocument", (res) => {
            const { _document, userList } = res;
            setText(_document);
            userList.forEach((u) => {
                setCursor(u);
            });
        });
    }, []);

    useEffect(() => {
        const setCursorHandler = (user) => {
            setCursor(user);
        };
        socket.on("newUser", setCursorHandler);
        return () => {
            socket.off("newUser", setCursorHandler);
        };
    }, []);

    useEffect(() => {
        if (!reactQuillRef.current) return;
        cursorRef.current = reactQuillRef.current
            .getEditor()
            .getModule("cursors");
    }, []);

    useEffect(() => {
        const updateContentHandler = (delta) => {
            reactQuillRef.current.getEditor().updateContents(delta);
        };
        socket.on("receive-changes", updateContentHandler);
        return () => {
            socket.off("receive-changes", updateContentHandler);
        };
    }, []);

    useEffect(() => {
        const updateHandler = (res) => {
            const { range, id } = res;
            debouncedUpdate(range, id);
        };
        socket.on("receive-cursor", updateHandler);
        return () => {
            socket.off("receive-cursor", updateHandler);
        };
    }, []);

    const onChangeTextHandler = (content, delta, source, editor) => {
        if (timerRef.current != null) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
            socket.emit(
                "save-document",
                reactQuillRef.current.getEditor().getContents()
            );
            timerRef.current = null;
        }, 1000);
        if (source !== "user") return;
        socket.emit("send-changes", delta);
    };

    const setCursor = (id) => {
        if (!cursorMap.get(id)) {
            cursorRef.current.createCursor(
                id,
                id,
                cursorColor[Math.floor(Math.random() * 8)]
            );
            cursorMap.set(id, cursorRef.current);
        }
    };

    const debouncedUpdate = debounce((range, id) => {
        cursorMap.get(id).moveCursor(id, range);
    }, 500);

    const onChangeSelection = (selection, source, editor) => {
        if (source !== "user") return;
        socket.emit("cursor-changes", selection);
    };

    return (
        <TextEditor
            text={text}
            onChangeTextHandler={onChangeTextHandler}
            onChangeSelection={onChangeSelection}
            reactQuillRef={reactQuillRef}
        />
    );
};

export default EditorContainer;
