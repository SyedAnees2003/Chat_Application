import { useAuth } from "../../context/AuthContext";

const MessageBubble = ({ message }) => {
  const { user } = useAuth();
  const isMine = message.sender_id === user.id;

  const statusIcon = {
    sent: "✓",
    delivered: "✓✓",
    read: "✓✓✓"
  };

  return (
    <div
      className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2 animate-fadeIn`}
    >
      <div
        className={`max-w-xs px-4 py-2.5 rounded-2xl shadow-lg transition-all duration-200 ${
          isMine
            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-md"
            : "bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-bl-md"
        }`}
      >
        {/* Message Content */}
        <div className="break-words">{message.content}</div>

        {/* Status Indicator for sent messages */}
        {isMine && (
          <div className="text-xs text-right mt-1 opacity-80 flex items-center justify-end gap-1">
            <span className="text-white/90">
              {statusIcon[message.status || "sent"]}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;