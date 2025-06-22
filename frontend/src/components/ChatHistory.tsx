"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import io from "socket.io-client";

interface ChatUser {
  _id: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
  unreadCount?: number;
  lastMessage?: {
    content: string;
    timestamp: string;
    read?: boolean;
  };
}

export default function ChatHistory() {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, user, setUnreadCount } = useAuth();

  const fetchChatHistory = () => {
    if (!token) return;

    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    fetch(`${apiUrl}/api/chats/history`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        // Update global unread count
        const totalUnread = data.reduce(
          (sum: number, chat: any) => sum + (chat.unreadCount || 0),
          0
        );
        setUnreadCount(totalUnread);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch chat history:", err);
        setUsers([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchChatHistory();
  }, [token]);

  // Refresh chat history periodically to get updated unread counts
  useEffect(() => {
    const interval = setInterval(() => {
      if (token) {
        fetchChatHistory();
      }
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [token]);

  // Handle real-time online/offline updates
  useEffect(() => {
    if (!user) return;

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    const socket = io(socketUrl);

    socket.emit("join", user._id);

    socket.on("user:online", ({ userId }) => {
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isOnline: true } : u))
      );
    });

    socket.on("user:offline", ({ userId }) => {
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isOnline: false } : u))
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 animate-pulse">
              <div className="w-12 h-12 bg-muted rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No conversations yet
        </h3>
        <p className="text-muted-foreground">
          Start a new chat to begin messaging!
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {users?.map((user) => (
        <Link
          key={user._id}
          href={`/chat/${user._id}`}
          className="block p-6 hover:bg-accent transition-all duration-200 group"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.email}
                  className="w-12 h-12 rounded-full object-cover border-2 border-border group-hover:border-primary/50 transition-colors"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-border flex items-center justify-center group-hover:border-primary/50 transition-colors">
                  <span className="text-lg font-semibold text-primary">
                    {user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {/* Online indicator */}
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${
                  user.isOnline ? "bg-green-500" : "bg-muted-foreground"
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {user.email}
                </h3>
                <div className="flex items-center gap-2">
                  {user.unreadCount && user.unreadCount > 0 && (
                    <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full font-medium animate-fade-in">
                      {user.unreadCount > 99 ? "99+" : user.unreadCount}
                    </span>
                  )}
                  {user.lastMessage && (
                    <span className="text-sm text-muted-foreground">
                      {new Date(
                        user.lastMessage.timestamp
                      ).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              {user.lastMessage && (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground truncate flex-1">
                    {user.lastMessage.content}
                  </p>
                  {user.lastMessage.read && (
                    <svg
                      className="w-4 h-4 text-primary flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
