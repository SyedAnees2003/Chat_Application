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
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center">
      <div className="bg-gray-800 p-4 w-96 rounded space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {activeConversation.name || "Group Info"}
          </h2>
          <button onClick={onClose}>✕</button>
        </div>

        {loading && <div className="text-sm text-gray-400">Loading...</div>}

        {/* MEMBERS */}
        <div>
          <h3 className="text-sm text-gray-400 mb-2">Members</h3>

          {members.map((m) => (
            <div
              key={m.user_id}
              className="flex justify-between items-center py-1"
            >
              <span>
                {m.User.name}
                {m.role === "admin" && (
                  <span className="ml-2 text-xs text-green-400">
                    Admin
                  </span>
                )}
              </span>

              {/* Remove / Leave */}
              {isAdmin && m.user_id !== user.id && (
                <button
                  onClick={() => handleRemove(m.user_id)}
                  className="text-red-400 text-sm"
                >
                  Remove
                </button>
              )}

              {!isAdmin && m.user_id === user.id && (
                <button
                  onClick={() => handleRemove(user.id)}
                  className="text-red-400 text-sm"
                >
                  Leave
                </button>
              )}
            </div>
          ))}
        </div>

        {/* ADD MEMBERS */}
        {isAdmin && (
          <>
            <hr className="border-gray-700" />

            <div>
              <h3 className="text-sm text-gray-400 mb-2">
                Add Members
              </h3>

              {users
                .filter((u) => !memberIds.includes(u.id))
                .map((u) => (
                  <div
                    key={u.id}
                    className="flex justify-between items-center py-1"
                  >
                    <span>{u.name}</span>
                    <button
                      onClick={() => handleAdd(u.id)}
                      className="text-green-400 text-sm"
                    >
                      Add
                    </button>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GroupInfo;
