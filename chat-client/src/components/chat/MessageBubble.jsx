const MessageBubble = ({ message, isMine }) => {
    return (
      <div
        className={`max-w-xs px-4 py-2 rounded-lg ${
          isMine
            ? "bg-green-500 text-black ml-auto"
            : "bg-gray-700 text-white"
        }`}
      >
        {message}
      </div>
    );
  };
  
  export default MessageBubble;
  