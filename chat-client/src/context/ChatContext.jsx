import { createContext, useContext, useEffect, useState } from "react";
import { getMyConversationsApi } from "../api/conversation.api";
import { getMessagesApi } from "../api/message.api";
import { useAuth } from "./AuthContext";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadConversations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const res = await getMyConversationsApi();
      setConversations(res.data);
    } catch (error) {
      console.error("ChatContext: Failed to load conversations", error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const res = await getMessagesApi(conversationId);
      setMessages(res.data);
    } catch {
      setMessages([]);
    }
  };

  // ✅ Load conversations ONLY after login
  useEffect(() => {
    if (user) {
      loadConversations();
    } else {
      setConversations([]);
      setActiveConversation(null);
      setMessages([]);
    }
  }, [user]);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id);
    } else {
      setMessages([]);
    }
  }, [activeConversation]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        setActiveConversation,
        messages,
        setMessages,
        loading,
        loadConversations
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
