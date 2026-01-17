import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";

const ChatHeader = () => {
  const { activeConversation } = useChat();
  const { user } = useAuth();

  if (!activeConversation) {
    return (
      <div className="h-16 px-4 flex items-center border-b border-gray-700 bg-gray-800">
        Select a chat
      </div>
    );
  }

  let title = activeConversation.name;

  if (activeConversation.type === "private") {
    const other = activeConversation.Users.find(
      (u) => u.id !== user.id
    );
    title = other?.name || "Chat";
  }

  return (
    <div className="h-16 px-4 flex items-center border-b border-gray-700 bg-gray-800">
      <div className="font-semibold text-lg">{title}</div>
    </div>
  );
};

export default ChatHeader;
