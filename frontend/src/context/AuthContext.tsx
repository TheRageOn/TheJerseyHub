"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "customer" | "admin";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage or verify with backend /api/auth/me
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem("tjh_token");
        const storedUser = localStorage.getItem("tjh_user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Verify with backend
          const res = await apiRequest<User>("/auth/me");
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem("tjh_user", JSON.stringify(res.data));
          }
        }
      } catch {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiRequest<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.data) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem("tjh_token", receivedToken);
      localStorage.setItem("tjh_user", JSON.stringify(receivedUser));
      return { success: true };
    }

    // Demo fallback if backend is offline
    if (res.message?.includes("Network error") || res.message?.includes("Failed to fetch")) {
      const mockUser: User = {
        id: "demo-collector-01",
        name: email.split("@")[0].toUpperCase() || "RAJAK",
        email,
        phone: "+977 9800000000",
        role: email.includes("admin") ? "admin" : "customer",
      };
      const mockToken = "mock_jwt_token_" + Date.now();
      setToken(mockToken);
      setUser(mockUser);
      localStorage.setItem("tjh_token", mockToken);
      localStorage.setItem("tjh_user", JSON.stringify(mockUser));
      return { success: true };
    }

    return { success: false, message: res.message || "Invalid credentials" };
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const res = await apiRequest<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, phone }),
    });

    if (res.success && res.data) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem("tjh_token", receivedToken);
      localStorage.setItem("tjh_user", JSON.stringify(receivedUser));
      return { success: true };
    }

    // Demo fallback if backend is offline
    if (res.message?.includes("Network error") || res.message?.includes("Failed to fetch")) {
      const mockUser: User = {
        id: "demo-collector-" + Date.now(),
        name,
        email,
        phone: phone || "+977 9800000000",
        role: "customer",
      };
      const mockToken = "mock_jwt_token_" + Date.now();
      setToken(mockToken);
      setUser(mockUser);
      localStorage.setItem("tjh_token", mockToken);
      localStorage.setItem("tjh_user", JSON.stringify(mockUser));
      return { success: true };
    }

    return { success: false, message: res.message || "Registration failed" };
  };

  const logout = async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch {}
    setToken(null);
    setUser(null);
    localStorage.removeItem("tjh_token");
    localStorage.removeItem("tjh_user");
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (!user) return;
    const newUserData = { ...user, ...updatedUser };
    setUser(newUserData);
    localStorage.setItem("tjh_user", JSON.stringify(newUserData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
