import { useState } from "react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import NewChatModal from "./NewChatModal";

const Sidebar = () => {
  const { conversations, setActiveConversation, loading } = useChat();
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const [openNewChat, setOpenNewChat] = useState(false);

  if (loading) {
    return (
      <div className="w-72 bg-gray-800 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-72 bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* New Chat Button */}
      <div className="p-3 border-b border-gray-700">
        <button
          onClick={() => setOpenNewChat(true)}
          className="w-full bg-green-500 text-black py-2 rounded"
        >
          + New Chat
        </button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => {
          let title = conversation.name;
          let subtitle = "";
          let isAdmin = false;
          let showOnlineDot = false;

          // PRIVATE CHAT
          if (conversation.type === "private") {
            const otherUser = conversation.Users.find(
              (u) => u.id !== user.id
            );

            title = otherUser ? otherUser.name : "Private Chat";

            const isOnline = otherUser
              ? onlineUsers.has(otherUser.id)
              : false;

            subtitle = isOnline ? "Online" : "Offline";
            showOnlineDot = true;
          }

          // GROUP CHAT
          if (conversation.type === "group") {
            const me = conversation.Users.find(
              (u) => u.id === user.id
            );

            isAdmin = me?.ConversationMember?.role === "admin";

            const onlineCount = conversation.Users.filter((u) =>
              onlineUsers.has(u.id)
            ).length;

            subtitle = `${onlineCount} online`;
          }

          return (
            <div
              key={conversation.id}
              onClick={() => setActiveConversation(conversation)}
              className="px-4 py-3 hover:bg-gray-700 cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{title}</span>

                  {showOnlineDot && (
                    <span
                      className={`h-2 w-2 rounded-full ${
                        subtitle === "Online"
                          ? "bg-green-400"
                          : "bg-gray-500"
                      }`}
                    />
                  )}
                </div>

                {isAdmin && (
                  <span className="text-xs text-green-400">
                    Admin
                  </span>
                )}
              </div>

              <div className="text-sm text-gray-400">
                {subtitle}
              </div>
            </div>
          );
        })}
      </div>

      {openNewChat && (
        <NewChatModal onClose={() => setOpenNewChat(false)} />
      )}
    </div>
  );
};

export default Sidebar;
