const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { User, Message } = require("../models");
const { sendMessageService } = require("../services/message.service");
const { Op } = require("sequelize"); // ✅ REQUIRED

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
    socket.on("join_conversation", async (conversationId) => {
      socket.join(`conversation_${conversationId}`);

       // ✅ FIXED: Sequelize operator
       await Message.update(
        { status: "read" },
        {
          where: {
            conversation_id: conversationId,
            sender_id: {
              [Op.ne]: userId
            }
          }
        }
      );

      io.to(`conversation_${conversationId}`).emit(
        "messages_read",
        { conversationId, userId }
      );
    });

    // ===== SEND MESSAGE =====
    socket.on("send_message", async (data) => {
      try {
        const message = await sendMessageService({
          conversationId: data.conversationId,
          senderId: userId,
          content: data.content,
          messageType: data.messageType
        });

        // delivered
        await Message.update(
          { status: "delivered" },
          { where: { id: message.id } }
        );

        io.to(`conversation_${data.conversationId}`).emit(
          "receive_message",
          {
            ...message.toJSON(),
            status: "delivered"
          }
        );
      } catch {
        socket.emit("error_message", {
          message: "Message send failed"
        });
      }
    });

    // ===== TYPING =====
    socket.on("typing", ({ conversationId }) => {
      socket
        .to(`conversation_${conversationId}`)
        .emit("user_typing", {
          conversationId,
          userId
        });
    });

    socket.on("stop_typing", ({ conversationId }) => {
      socket
        .to(`conversation_${conversationId}`)
        .emit("user_stop_typing", {
          conversationId,
          userId
        });
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

// ===== MEMBER EVENTS =====
const emitMemberAdded = (conversationId, user) => {
  if (!io) return;
  io.to(`conversation_${conversationId}`).emit(
    "member_added",
    { conversationId, user }
  );
};

const emitMemberRemoved = (conversationId, userId) => {
  if (!io) return;
  io.to(`conversation_${conversationId}`).emit(
    "member_removed",
    { conversationId, userId }
  );
};

module.exports = {
  initSocket,
  getIO,
  emitMemberAdded,
  emitMemberRemoved
};
