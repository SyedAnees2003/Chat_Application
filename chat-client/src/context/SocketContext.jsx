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

  return (
    <SocketContext.Provider
      value={{ sendMessageSocket, onlineUsers }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
