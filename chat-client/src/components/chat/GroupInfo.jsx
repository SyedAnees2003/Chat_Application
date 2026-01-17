import { useEffect, useState } from "react";
import {
  getConversationMembersApi,
  addMemberApi,
  removeMemberApi
} from "../../api/conversation.api";
import { getUsersApi } from "../../api/user.api";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";

const GroupInfo = ({ onClose }) => {
  const { activeConversation, loadConversations } = useChat();
  const { user } = useAuth();

  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    if (!activeConversation) return;

    setLoading(true);
    try {
      const [membersRes, usersRes] = await Promise.all([
        getConversationMembersApi(activeConversation.id),
        getUsersApi()
      ]);

      setMembers(membersRes.data);
      setUsers(usersRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeConversation.id]);

  const myMemberRecord = members.find(
    (m) => m.user_id === user.id
  );
  const isAdmin = myMemberRecord?.role === "admin";

  const handleAdd = async (userId) => {
    try {
      await addMemberApi(activeConversation.id, userId);
      await loadData();
      loadConversations();
    } catch (err) {
      alert("Only admin can add members");
    }
  };

  const handleRemove = async (userId) => {
    try {
      await removeMemberApi(activeConversation.id, userId);
      await loadData();
      loadConversations();

      if (userId === user.id) {
        onClose();
      }
    } catch (err) {
      alert("Only admin can remove members");
    }
  };

  const memberIds = members.map((m) => m.user_id);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {activeConversation.name || "Group Info"}
              </h2>
              <p className="text-sm text-gray-400">{members.length} members</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2">
            {/* MEMBERS SECTION */}
            <div>
              <h3 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Members
              </h3>

              <div className="space-y-2">
                {members.map((m) => (
                  <div
                    key={m.user_id}
                    className="flex justify-between items-center p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {m.User.name.charAt(0).toUpperCase()}
                      </div>
                      
                      {/* Name and Role */}
                      <div>
                        <span className="text-white font-medium">{m.User.name}</span>
                        {m.role === "admin" && (
                          <span className="ml-2 text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Remove / Leave Buttons */}
                    {isAdmin && m.user_id !== user.id && (
                      <button
                        onClick={() => handleRemove(m.user_id)}
                        className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Remove
                      </button>
                    )}

                    {!isAdmin && m.user_id === user.id && (
                      <button
                        onClick={() => handleRemove(user.id)}
                        className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Leave
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ADD MEMBERS SECTION */}
            {isAdmin && (
              <>
                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Add Members
                  </h3>

                  <div className="space-y-2">
                    {users
                      .filter((u) => !memberIds.includes(u.id))
                      .map((u) => (
                        <div
                          key={u.id}
                          className="flex justify-between items-center p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200"
                        >
                          <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            
                            {/* Name */}
                            <span className="text-white font-medium">{u.name}</span>
                          </div>

                          <button
                            onClick={() => handleAdd(u.id)}
                            className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add
                          </button>
                        </div>
                      ))}
                    
                    {users.filter((u) => !memberIds.includes(u.id)).length === 0 && (
                      <div className="text-center py-6 text-gray-400 text-sm">
                        All users are already members
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
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

export default GroupInfo;