import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import GroupInfo from "./GroupInfo";

const ChatHeader = () => {
  const { activeConversation } = useChat();
  const [openInfo, setOpenInfo] = useState(false);

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
    <>
    <div className="h-16 px-4 flex items-center border-b border-gray-700 bg-gray-800">
      <div className="font-semibold text-lg">{title}
      </div>
      {activeConversation.type === "group" && (
          <button onClick={() => setOpenInfo(true)}>
            Group Info
          </button>
        )}
    </div>
          {openInfo && <GroupInfo onClose={() => setOpenInfo(false)} />}
    </>
  );
};

export default ChatHeader;
