import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { authService } from "../api/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const bootstrap = async () => {
    try {
      const response = await authService.me();
      setUser(response.data.data);
    } catch (_error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bootstrap();
  }, []);

  const login = async (payload) => {
    const response = await authService.login(payload);
    setUser(response.data.data);
    toast.success("Welcome back.");
    return response.data;
  };

  const register = async (payload) => {
    const response = await authService.register(payload);
    toast.success("Account created. Please login.");
    return response.data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    toast.success("Logged out.");
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshUser: bootstrap,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}
