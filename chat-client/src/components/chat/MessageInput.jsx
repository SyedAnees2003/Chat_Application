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
    <div className="px-6 py-4 bg-white/5 backdrop-blur-xl border-t border-white/10">
      <div className="flex items-center gap-3">
        {/* Input Field */}
        <div className="flex-1 relative">
          <input
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
          
          {/* Optional: Emoji button placeholder */}
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
        >
          <span>Send</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MessageInput;