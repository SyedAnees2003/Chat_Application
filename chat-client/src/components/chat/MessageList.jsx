import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import MessageBubble from "./MessageBubble";

const MessageList = () => {
  const { messages, activeConversation } = useChat();
  const { user } = useAuth();

  if (!activeConversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Select a conversation
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900">
      {messages.map((m) => (
        <MessageBubble
          key={m.id}
          message={m.content}
          isMine={m.sender_id === user.id}
        />
      ))}
    </div>
  );
};

export default MessageList;
