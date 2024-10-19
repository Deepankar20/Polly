import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
interface SocketUserMapping {
  [key: string]: string; // key is socket.id, value is the email
}
interface data {
  pollId: string;
  questionType?: string;
  options?: string;
  question: string;
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
  private adminSocketId: string = "";

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

      socket.on("event:userJoined", (data: string) => {
        console.log("inside socket server", data);

        // socket.join(userData.pollId);
      });

      socket.on("event:startInteraction", (data: string) => {
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

export default SocketService;
