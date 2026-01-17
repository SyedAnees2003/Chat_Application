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
      <div className="h-16 px-6 flex items-center border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <span className="text-gray-400">Select a chat</span>
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
      <div className="h-16 px-6 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
            {title.charAt(0).toUpperCase()}
          </div>
          
          {/* Title */}
          <div>
            <div className="font-semibold text-lg text-white">{title}</div>
            {activeConversation.type === "group" && (
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {activeConversation.Users?.length || 0} members
              </div>
            )}
          </div>
        </div>

        {/* Group Info Button */}
        {activeConversation.type === "group" && (
          <button 
            onClick={() => setOpenInfo(true)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 text-sm font-medium text-white flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Group Info
          </button>
        )}
      </div>
      
      {openInfo && <GroupInfo onClose={() => setOpenInfo(false)} />}
    </>
  );
};

export default ChatHeader;