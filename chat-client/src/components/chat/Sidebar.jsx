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
      <div className="w-72 bg-white/5 backdrop-blur-xl border-r border-white/10 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-300 text-sm">Loading chats...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col">
      {/* New Chat Button */}
      <div className="p-4 border-b border-white/10">
        <button
          onClick={() => setOpenNewChat(true)}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 group"
        >
          <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <svg className="w-16 h-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-gray-400 text-sm">No conversations yet</p>
            <p className="text-gray-500 text-xs mt-1">Start a new chat to get started</p>
          </div>
        ) : (
          conversations.map((conversation) => {
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
                className="px-4 py-3 hover:bg-white/10 cursor-pointer transition-all duration-200 border-b border-white/5 group"
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white group-hover:text-purple-300 transition-colors">
                      {title}
                    </span>

                    {showOnlineDot && (
                      <span
                        className={`h-2 w-2 rounded-full ${
                          subtitle === "Online"
                            ? "bg-green-400 animate-pulse"
                            : "bg-gray-500"
                        }`}
                      />
                    )}
                  </div>

                  {isAdmin && (
                    <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                      Admin
                    </span>
                  )}
                </div>

                <div className="text-sm text-gray-400 flex items-center gap-1">
                  {conversation.type === "group" && (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  )}
                  {subtitle}
                </div>
              </div>
            );
          })
        )}
      </div>

      {openNewChat && (
        <NewChatModal onClose={() => setOpenNewChat(false)} />
      )}
    </div>
  );
};

export default Sidebar;