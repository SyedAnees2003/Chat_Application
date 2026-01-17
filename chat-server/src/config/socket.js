const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { sendMessageService } = require("../services/message.service");

let io;

// userId -> Set(socketIds)
const onlineUsers = new Map();

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
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;

    // ===== USER ONLINE =====
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
      io.emit("user_online", userId);
    }
    onlineUsers.get(userId).add(socket.id);

    // ===== JOIN CONVERSATION =====
    socket.on("join_conversation", (conversationId) => {
      socket.join(`conversation_${conversationId}`);
    });

    // ===== SEND MESSAGE =====
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
      } catch {
        socket.emit("error_message", {
          message: "Message send failed"
        });
      }
    });

    // ===== DISCONNECT =====
    socket.on("disconnect", () => {
      const sockets = onlineUsers.get(userId);
      if (!sockets) return;

      sockets.delete(socket.id);

      if (sockets.size === 0) {
        onlineUsers.delete(userId);
        io.emit("user_offline", userId);
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};

// ===== MEMBER EVENTS (UNCHANGED) =====

const emitMemberAdded = (conversationId, user) => {
  if (!io) return;
  io.to(`conversation_${conversationId}`).emit("member_added", {
    conversationId,
    user
  });
};

const emitMemberRemoved = (conversationId, userId) => {
  if (!io) return;
  io.to(`conversation_${conversationId}`).emit("member_removed", {
    conversationId,
    userId
  });
};

module.exports = {
  initSocket,
  getIO,
  emitMemberAdded,
  emitMemberRemoved
};
