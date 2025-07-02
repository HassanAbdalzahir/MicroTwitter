"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { config } from "../config/env";

interface User {
  _id: string;
  email: string;
  username: string;
  createdAt: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  unreadCount: number;
  setUnreadCount: (count: number | ((prev: number) => number)) => void;
  login: (email: string, password: string) => Promise<string | null>;
  register: (
    email: string,
    username: string,
    password: string,
    avatar: string
  ) => Promise<string | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("auth");
    if (stored) {
      const { user, token } = JSON.parse(stored);
      setUser(user);
      setToken(token);
    }
  }, []);

  const saveAuth = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("auth", JSON.stringify({ user, token }));
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${config.apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        saveAuth(data.user, data.token);
        return null;
      } else {
        return data.error || "Login failed";
      }
    } catch {
      return "Login failed";
    }
  };

  const register = async (
    email: string,
    username: string,
    password: string,
    avatar: string
  ) => {
    try {
      const res = await fetch(`${config.apiUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password, avatar }),
      });
      const data = await res.json();
      if (res.ok) {
        saveAuth(data.user, data.token);
        return null;
      } else {
        return data.error || "Registration failed";
      }
    } catch {
      return "Registration failed";
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setUnreadCount(0);
    localStorage.removeItem("auth");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        unreadCount,
        setUnreadCount,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
