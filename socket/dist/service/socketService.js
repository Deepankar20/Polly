"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
class SocketService {
    constructor() {
        this.users = {};
        this.adminSocketId = "";
        console.log("Init socket service...");
        this._io = new socket_io_1.Server({
            cors: {
                allowedHeaders: ["*"],
                origin: "*",
            },
        });
    }
    initListeners() {
        const io = this.io;
        io.on("connect", (socket) => {
            console.log("New socket connected : ", socket.id);
            const token = socket.handshake.query.userEmail;
            console.log(token);
            if (token) {
                this.users[token] = socket.id;
                console.log(this.users);
            }
            socket.on("event:userJoined", (data) => {
                console.log("inside socket server", data);
                // socket.join(userData.pollId);
            });
            socket.on("event:startInteraction", (data) => {
                const pollData = JSON.parse(data);
                console.log(pollData);
                const { pollId, questionType, question } = pollData;
                this.adminSocketId = socket.id;
                let options;
                if (questionType === "MCQ") {
                    options = pollData.options;
                }
                const quesData = JSON.stringify({
                    pollId,
                    questionType,
                    question,
                    options,
                });
                io.to(pollId).emit("reply:pollStart", quesData);
            });
            socket.on("event:userAnswer", (data) => {
                const { response, questionType, pollId } = JSON.parse(data);
                io.to(this.adminSocketId).emit("reply:userResponse", data);
            });
        });
    }
    get io() {
        return this._io;
    }
}
exports.default = SocketService;
