const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { sendMessageService } = require("../services/message.service");

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Unauthorized"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);

      if (!user) return next(new Error("Unauthorized"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("join_conversation", (conversationId) => {
      socket.join(`conversation_${conversationId}`);
    });

    socket.on("send_message", async (data) => {
      try {
        const message = await sendMessageService({
          conversationId: data.conversationId,
          senderId: socket.user.id,
          content: data.content,
          messageType: data.messageType
        });

        io.to(`conversation_${data.conversationId}`).emit(
          "receive_message",
          message
        );
      } catch (error) {
        socket.emit("error_message", {
          message: "Message send failed"
        });
      }
    });

    socket.on("disconnect", () => {});
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};

module.exports = {
  initSocket,
  getIO
};
