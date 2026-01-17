import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import { connectSocket, disconnectSocket, getSocket } from "../socket/socket";
import { useAuth } from "./AuthContext";
import { useChat } from "./ChatContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  const {
    activeConversation,
    setMessages,
    loadConversations
  } = useChat();

  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    if (!token) return;

    socketRef.current = connectSocket(token);

    socketRef.current.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketRef.current.on("member_added", () => {
      loadConversations();
    });

    socketRef.current.on("member_removed", () => {
      loadConversations();
    });

    socketRef.current.on("messages_read", ({ userId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.sender_id === userId ? m : { ...m, status: "read" }
        )
      );
    });

    socketRef.current.on("user_typing", ({ userId }) => {
      setTypingUsers((prev) =>
        prev.includes(userId) ? prev : [...prev, userId]
      );
    });

    socketRef.current.on("user_stop_typing", ({ userId }) => {
      setTypingUsers((prev) =>
        prev.filter((id) => id !== userId)
      );
    });

    // ===== PRESENCE EVENTS =====
    socketRef.current.on("user_online", (userId) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    socketRef.current.on("user_offline", (userId) => {
      setOnlineUsers((prev) => {
        const copy = new Set(prev);
        copy.delete(userId);
        return copy;
      });
    });

    return () => {
      disconnectSocket();
      setOnlineUsers(new Set());
      setTypingUsers([]);
    };
  }, [token]);

  useEffect(() => {
    if (!socketRef.current || !activeConversation) return;

    socketRef.current.emit(
      "join_conversation",
      activeConversation.id
    );
  }, [activeConversation]);

  const sendMessageSocket = (data) => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit("send_message", data);
  };

  const emitTyping = (conversationId) => {
    const socket = getSocket();
    socket.emit("typing", { conversationId });
  };

  const emitStopTyping = (conversationId) => {
    const socket = getSocket();
    socket.emit("stop_typing", { conversationId });
  };

  return (
    <SocketContext.Provider
      value={{ sendMessageSocket, onlineUsers, typingUsers, emitTyping, emitStopTyping }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
