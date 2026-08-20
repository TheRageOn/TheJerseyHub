"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, AuthUser, RegisterPayload, LoginPayload } from "@/lib/api";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Validate session against backend /api/auth/me using httpOnly cookie
  const refreshUser = useCallback(async () => {
    try {
      const res = await api.auth.me();
      if (res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Clear any old, legacy tokens from localStorage to prevent security leaks
    if (typeof window !== "undefined") {
      localStorage.removeItem("tjh_auth_token");
      localStorage.removeItem("tjh_auth_user");
    }
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const res = await api.auth.login(payload);
      if (res.data?.user) {
        setUser(res.data.user);
        router.push("/dashboard");
      } else {
        throw new Error(res.message || "Authentication failed");
      }
    },
    [router]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const res = await api.auth.register(payload);
      if (res.data?.user) {
        setUser(res.data.user);
        router.push("/dashboard");
      } else {
        throw new Error(res.message || "Registration failed");
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      router.push("/login");
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
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
