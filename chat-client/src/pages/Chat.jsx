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
    <div className="h-screen flex bg-gray-900 text-white">
      <AppSidebar
        open={appSidebarOpen}
        toggle={() => setAppSidebarOpen(!appSidebarOpen)}
      />

      <Sidebar />

      <ChatArea />
    </div>
  );
};

export default Chat;
