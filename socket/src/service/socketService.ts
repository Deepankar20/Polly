import { Server } from "socket.io";
import jwt from "jsonwebtoken";
interface SocketUserMapping {
  [key: string]: string; // key is socket.id, value is the email
}

class SocketService {
  private _io: Server;

  constructor() {
    console.log("Init socket service...");

    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });
  }

  private users: SocketUserMapping = {};

  public initListeners() {
    const io = this.io;

    io.on("connect", (socket) => {
      console.log("New socket connected : ", socket.id);
      const token = socket.handshake.query.userEmail;

      console.log(token);

      if (token) {
        this.users[token as string] = socket.id;
        console.log(this.users);
      }

      socket.on("event:userJoined", (data) => {});

      socket.on("event:pollStart", (data) => {});

      socket.on("event:userAnswer", (data) => {});



      socket.on("event:message", (data) => {
        const { from, to, content } = JSON.parse(data);
        const recieverSocketID = this.users[to.email];

        io.to(recieverSocketID).emit("event:message:reply", data);
      });

      socket.on("event:typing", (data) => {
        const { to, isTyping } = data;
        const recieverSocketID = this.users[to.email];

        io.to(recieverSocketID).emit("event:typing:back", data.isTyping);
      });
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
