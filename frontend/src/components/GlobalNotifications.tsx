"use client";

import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { usePathname } from "next/navigation";
import io from "socket.io-client";
import { config } from "../config/env";

export default function GlobalNotifications() {
  const { user, token, unreadCount, setUnreadCount } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!user || !token) return;

    const socket = io(config.socketUrl, { path: config.socketPath });

    socket.emit("join", user._id);

    // Listen for new messages
    socket.on("chat:receive", (msg: any) => {
      // Only update unread count if we're not in the chat with this user
      const isInChatWithSender = pathname === `/chat/${msg.from}`;
      const isInChatWithReceiver = pathname === `/chat/${msg.to}`;
      const isInChat = isInChatWithSender || isInChatWithReceiver;

      // If message is for current user and we're not in the chat, increment unread count
      if (msg.to === user._id && !isInChat) {
        setUnreadCount((prev: number) => prev + 1);
      }
    });

    // Listen for read receipts to decrease unread count
    socket.on("chat:read", ({ from, to }) => {
      // If we're marking messages as read (we're the 'to' user), decrease count
      if (to === user._id) {
        // Fetch updated unread count from server
        fetch(`${config.apiUrl}/api/chats/history`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => {
            const totalUnread = data.reduce(
              (sum: number, chat: any) => sum + (chat.unreadCount || 0),
              0
            );
            setUnreadCount(totalUnread);
          })
          .catch((err) =>
            console.error("Failed to fetch updated unread count:", err)
          );
      }
    });

    // Fetch initial unread count
    fetch(`${config.apiUrl}/api/chats/history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const totalUnread = data.reduce(
          (sum: number, chat: any) => sum + (chat.unreadCount || 0),
          0
        );
        setUnreadCount(totalUnread);
      })
      .catch((err) =>
        console.error("Failed to fetch initial unread count:", err)
      );

    return () => {
      socket.disconnect();
    };
  }, [user, token, pathname, setUnreadCount]);

  // Reset unread count when entering chat page
  useEffect(() => {
    if (pathname.startsWith("/chat/") && user && token) {
      // Reset count when entering a specific chat
      setUnreadCount(0);
    }
  }, [pathname, user, token, setUnreadCount]);

  return null; // This component doesn't render anything
}
