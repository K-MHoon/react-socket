const mongoose = require("mongoose");
const groupMsg = require("./groupMsg");
const common = require("./common");
const privateMsg = require("./privateMsg");

const uri = "mongodb://127.0.0.1:27017";

mongoose.set("strictQuery", false);
mongoose
    .connect(uri)
    .then(() => console.log("MongoDB Connected..."))
    .catch((err) => console.log(err));

const io = require("socket.io")(5000, {
    cors: {
        origin: "http://localhost:3000",
    },
});

common.commoninit(io);
groupMsg.groupMsginit(io);
privateMsg.privateMsginit(io);
