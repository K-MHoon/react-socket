import React, { useContext, useEffect, useState } from "react";
import { socket } from "../../socket";
import { Context } from "../../context";
import Navbar from "../../components/navbar/Navbar";
import Card from "../../components/card/Card";

const PostingContainer = () => {
    const {
        state: { userName },
    } = useContext(Context);
    const [post, setPost] = useState([]);

    useEffect(() => {
        socket.emit("userList", {});
    }, []);

    useEffect(() => {
        const setPosting = (data) => {
            setPost(data);
        };
        socket.on("user-list", setPosting);
        return () => {
            socket.off("user-list", setPosting);
        };
    }, []);

    return (
        <div>
            <h2>{`Login as a ${userName}`}</h2>
            <div>
                <Navbar />
                {post.map((p) => (
                    <Card key={p.id} post={p} loginUser={userName} />
                ))}
            </div>
        </div>
    );
};

export default PostingContainer;
