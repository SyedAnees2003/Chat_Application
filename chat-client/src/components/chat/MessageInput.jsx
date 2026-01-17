import { useState } from "react";
import { useChat } from "../../context/ChatContext";
import { useSocket } from "../../context/SocketContext";

const MessageInput = () => {
  const { activeConversation } = useChat();
  const { sendMessageSocket, emitTyping, emitStopTyping } = useSocket();
  const [message, setMessage] = useState("");

  if (!activeConversation) return null;

  const handleChange = (e) => {
    setMessage(e.target.value);

    emitTyping(activeConversation.id);

    setTimeout(() => {
      emitStopTyping(activeConversation.id);
    }, 800);
  };

  const handleSend = () => {
    if (!message.trim()) return;

    sendMessageSocket({
      conversationId: activeConversation.id,
      content: message,
      messageType: "text"
    });

    setMessage("");
    emitStopTyping(activeConversation.id);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="h-16 px-4 flex items-center bg-gray-800 border-t border-gray-700">
      <input
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="flex-1 px-4 py-2 rounded bg-gray-700 text-white outline-none"
      />
      <button
        onClick={handleSend}
        className="ml-3 px-4 py-2 bg-green-500 text-black rounded"
      >
        Send
      </button>
    </div>
  );
};

export default MessageInput;
