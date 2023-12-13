const http = require("http");
const sockjs = require("sockjs");

const sock = sockjs.createServer();

const clients = new Map();

sock.on("connection", (conn) => {
    let myId = "";

    conn.on("data", (message) => {
        const { data, type, id } = JSON.parse(message);

        switch (type) {
            case "id":
                myId = data;
                clients.set(data, conn);
                break;
            case "msg":
                clients.forEach((value, key, map) => {
                    if (key !== myId) {
                        value.write(JSON.stringify({ data: data, id: id }));
                    }
                });
                break;
            default:
                break;
        }
    });

    conn.on("close", () => {
        clients.delete(myId);
    });
});

const server = http.createServer();
sock.installHandlers(server, { prefix: "/sock" });
server.listen(9999, "0.0.0.0");
