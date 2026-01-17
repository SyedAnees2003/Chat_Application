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
      className={`max-w-xs px-4 py-2 rounded-lg mb-1 ${
        isMine
          ? "bg-green-500 text-black ml-auto"
          : "bg-gray-700 text-white"
      }`}
    >
      <div>{message.content}</div>

      {isMine && (
        <div className="text-xs text-right mt-1 opacity-70">
          {statusIcon[message.status || "sent"]}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
