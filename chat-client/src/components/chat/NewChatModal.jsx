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
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="bg-gray-800 p-4 w-96 rounded space-y-3">
        <h2 className="text-lg font-semibold">New Chat</h2>

        {/* Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setMode("private");
              setSelectedUsers([]);
            }}
            className={`flex-1 py-1 rounded ${
              mode === "private"
                ? "bg-green-500 text-black"
                : "bg-gray-700"
            }`}
          >
            Private
          </button>
          <button
            onClick={() => {
              setMode("group");
              setSelectedUsers([]);
            }}
            className={`flex-1 py-1 rounded ${
              mode === "group"
                ? "bg-green-500 text-black"
                : "bg-gray-700"
            }`}
          >
            Group
          </button>
        </div>

        {mode === "group" && (
          <input
            placeholder="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full p-2 rounded bg-gray-700"
          />
        )}

        {/* User List */}
        <div className="max-h-40 overflow-y-auto space-y-1">
          {users
            .filter((u) => u.id !== user.id)
            .map((u) => (
              <label
                key={u.id}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type={mode === "private" ? "radio" : "checkbox"}
                  name={mode === "private" ? "privateUser" : undefined}
                  checked={selectedUsers.includes(u.id)}
                  onChange={() => handleSelectUser(u.id)}
                />
                {u.name}
              </label>
            ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={handleCreate}
            className="bg-green-500 text-black px-3 py-1 rounded"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
