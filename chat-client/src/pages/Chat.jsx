import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import AppSidebar from "../components/layout/AppSidebar";
import Sidebar from "../components/chat/Sidebar";
import ChatArea from "../components/chat/ChatArea";

const Chat = () => {
  const { user, loading } = useAuth();
  const [appSidebarOpen, setAppSidebarOpen] = useState(true);

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Subtle background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
      </div>

      <div className="relative z-10 flex w-full">
        <AppSidebar
          open={appSidebarOpen}
          toggle={() => setAppSidebarOpen(!appSidebarOpen)}
        />

        <Sidebar />

        <ChatArea />
      </div>
    </div>
  );
};

export default Chat;