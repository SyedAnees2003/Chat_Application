import { FiMenu, FiUser, FiMessageSquare, FiLogOut } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const AppSidebar = ({ open, toggle }) => {
  const { logout } = useAuth();

  return (
    <div
      className={`${
        open ? "w-56" : "w-16"
      } transition-all duration-300 bg-gray-800 border-r border-gray-700 flex flex-col`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
        {open && <span className="font-semibold">Chat App</span>}
        <button onClick={toggle}>
          <FiMenu size={20} />
        </button>
      </div>

      <div className="flex-1 py-4 space-y-1">
        <SidebarItem icon={<FiUser />} label="Profile" open={open} />
        <SidebarItem icon={<FiMessageSquare />} label="Chats" open={open} />
      </div>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 text-red-400 hover:text-red-500"
        >
          <FiLogOut />
          {open && "Logout"}
        </button>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, open }) => {
  return (
    <div className="px-4 py-2 flex items-center gap-3 hover:bg-gray-700 cursor-pointer">
      {icon}
      {open && <span>{label}</span>}
    </div>
  );
};

export default AppSidebar;
