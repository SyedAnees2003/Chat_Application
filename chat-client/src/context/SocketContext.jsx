import { createContext, useContext, useEffect, useRef } from "react";
import { connectSocket, disconnectSocket, getSocket } from "../socket/socket";
import { useAuth } from "./AuthContext";
import { useChat } from "./ChatContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  const { activeConversation, setMessages } = useChat();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    socketRef.current = connectSocket(token);

    socketRef.current.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      disconnectSocket();
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
    <SocketContext.Provider value={{ sendMessageSocket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
