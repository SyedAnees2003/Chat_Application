import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useChat } from "../../context/ChatContext";
import { useSocket } from "../../context/SocketContext";

const ChatArea = () => {
    const { activeConversation } = useChat();
    const { typingUsers } = useSocket();

  if (!activeConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-400">
        Select a conversation to start chatting
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <ChatHeader />
      <MessageList />
      {typingUsers.length > 0 && (
        <div className="px-4 text-sm text-gray-400">
          Typing...
        </div>
      )}
      <MessageInput />
    </div>
  );
};

export default ChatArea;
