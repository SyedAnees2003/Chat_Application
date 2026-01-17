import { createContext, useContext, useEffect, useState } from "react";
import { loginApi, registerApi } from "../api/auth.api";
import { connectSocket, disconnectSocket } from "../socket/socket";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      connectSocket(storedToken);
    }

    setLoading(false);
  }, []);

  const login = async (data) => {
    const res = await loginApi(data);
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setToken(res.data.token);
    setUser(res.data.user);


    connectSocket(res.data.token);
  };

  const register = async (data) => {
    const res = await registerApi(data);
    setUser(res.data.user);
    setToken(res.data.token);

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    connectSocket(res.data.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    disconnectSocket();
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
