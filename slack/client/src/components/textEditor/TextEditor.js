import React from "react";
import { css } from "@emotion/react";
import { containerCss, sendCss } from "./TextEditor.style";
import "react-quill/dist/quill.snow.css";
import { HiPaperAirplane } from "react-icons/hi2";
import ReactQuill, { Quill } from "react-quill";

const modules = {
    toolbar: {
        containers: [
            [{ list: "ordered" }, { list: "bullet" }],
            ["bold", "italic", "underline", "strike"],
            [{ script: "sub" }, { script: "super" }],
        ],
    },
};

const TextEditor = ({
    text,
    onChangeTextHandler,
    reactQuillRef,
    onSendHandler,
}) => {
    return (
        <div css={containerCss}>
            <HiPaperAirplane css={sendCss} onClick={onSendHandler} />
            <ReactQuill
                theme="snow"
                modules={modules}
                value={text}
                onChange={onChangeTextHandler}
                ref={(el) => {
                    reactQuillRef.current = el;
                }}
            ></ReactQuill>
        </div>
    );
};

export default TextEditor;
