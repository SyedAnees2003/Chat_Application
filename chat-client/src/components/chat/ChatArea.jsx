import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useChat } from "../../context/ChatContext";

const ChatArea = () => {
    const { activeConversation } = useChat();

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
      <MessageInput />
    </div>
  );
};

export default ChatArea;
