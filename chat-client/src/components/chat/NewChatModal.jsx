import { useEffect, useState } from "react";
import { getUsersApi } from "../../api/user.api";
import api from "../../api/axios";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";

const NewChatModal = ({ onClose }) => {
  const { user } = useAuth();
  const {
    conversations,
    loadConversations,
    setActiveConversation
  } = useChat();

  const [users, setUsers] = useState([]);
  const [mode, setMode] = useState("private");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getUsersApi().then((res) => setUsers(res.data));
  }, []);

  const existingPrivateConversation = (otherUserId) => {
    return conversations.find((conversation) => {
      if (conversation.type !== "private") return false;
  
      const ids = conversation.Users.map((u) => u.id);
      return ids.includes(user.id) && ids.includes(otherUserId);
    });
  };
  

  const handleSelectUser = (id) => {
    if (mode === "private") {
      // ONLY one selection allowed
      setSelectedUsers([id]);
    } else {
      // Toggle for group
      setSelectedUsers((prev) =>
        prev.includes(id)
          ? prev.filter((u) => u !== id)
          : [...prev, id]
      );
    }
  };

  const handleCreate = async () => {
    if (mode === "private" && selectedUsers.length !== 1) {
      alert("Select exactly one user");
      return;
    }

    if (mode === "group" && selectedUsers.length < 2) {
      alert("Select at least two users");
      return;
    }

    if (mode === "group" && !groupName.trim()) {
      alert("Enter group name");
      return;
    }

    if (mode === "private") {
      const existing = existingPrivateConversation(selectedUsers[0]);
    
      if (existing) {
        setActiveConversation(existing);
        onClose();
        return;
      }
    }    

    setLoading(true);
    
    try {
      let res;

      if (mode === "private") {
        res = await api.post("/conversations/private", {
          userId: selectedUsers[0]
        });
      } else {
        res = await api.post("/conversations/group", {
          name: groupName,
          members: selectedUsers
        });
      }

      await loadConversations();
      setActiveConversation(res.data);
      onClose();
    } catch {
      alert("Failed to create chat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">New Chat</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-3 mb-5">
          <button
            onClick={() => {
              setMode("private");
              setSelectedUsers([]);
            }}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200 ${
              mode === "private"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Private
            </div>
          </button>
          <button
            onClick={() => {
              setMode("group");
              setSelectedUsers([]);
            }}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200 ${
              mode === "group"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Group
            </div>
          </button>
        </div>

        {/* Group Name Input */}
        {mode === "group" && (
          <div className="mb-5">
            <label className="block text-sm font-medium text-purple-100 mb-2">
              Group Name
            </label>
            <input
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
        )}

        {/* User Selection Label */}
        <label className="block text-sm font-medium text-purple-100 mb-3">
          {mode === "private" ? "Select User" : "Select Members"}
        </label>

        {/* User List */}
        <div className="max-h-64 overflow-y-auto space-y-2 mb-6 pr-2 custom-scrollbar">
          {users
            .filter((u) => u.id !== user.id)
            .map((u) => (
              <label
                key={u.id}
                className="flex items-center gap-3 p-3 cursor-pointer bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200 group"
              >
                <div className="relative">
                  <input
                    type={mode === "private" ? "radio" : "checkbox"}
                    name={mode === "private" ? "privateUser" : undefined}
                    checked={selectedUsers.includes(u.id)}
                    onChange={() => handleSelectUser(u.id)}
                    className="w-5 h-5 text-purple-500 bg-white/10 border-white/30 rounded focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                {/* User Avatar */}
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                
                {/* User Name */}
                <span className="text-white group-hover:text-purple-300 transition-colors font-medium">
                  {u.name}
                </span>
              </label>
            ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border-2 border-white/30 text-white font-semibold hover:bg-white/10 hover:border-white/50 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Chat
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.4);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.6);
        }
      `}</style>
    </div>
  );
};

export default NewChatModal;