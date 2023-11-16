const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 5000 });

wss.on("connection", (ws) => {
    const broadCastHandler = (msg) => {
        wss.clients.forEach(function each(client, i) {
            console.log(client);
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(msg);
            }
        });
    };

    ws.on("message", (res) => {
        const { type, data, id } = JSON.parse(res);
        switch (type) {
            case "id":
                broadCastHandler(
                    JSON.stringify({ type: "welcome", data: data })
                );
                break;
            case "msg":
                broadCastHandler(
                    JSON.stringify({ type: "other", data: data, id: id })
                );
                break;
            default:
                break;
        }
    });

    ws.on("close", () => {
        console.log("client has disconnected");
    });
});
