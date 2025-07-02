"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import io from "socket.io-client";
import Link from "next/link";
import { config } from "../../../config/env";

interface ChatMessage {
  _id?: string;
  from: string;
  to: string;
  content: string;
  createdAt: string;
  read?: boolean;
}

interface ChatUser {
  _id: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
}

export default function ChatConversation({
  params,
}: {
  params: { userId: string };
}) {
  const router = useRouter();
  const { user, token, setUnreadCount } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [chatUser, setChatUser] = useState<ChatUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isUserOnline, setIsUserOnline] = useState(false);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user || !token) {
      router.push("/login");
      return;
    }

    // Fetch chat user details
    fetch(`${config.apiUrl}/users/${params.userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setChatUser(data);
        setIsUserOnline(data.isOnline || false);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch user:", error);
      });

    // Fetch chat history
    fetch(`${config.apiUrl}/chats/${params.userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setMessages(data);
        // Mark any unread messages as read
        if (
          data.some(
            (msg: ChatMessage) => msg.from === params.userId && !msg.read
          )
        ) {
          markAsRead();
        }
      });

    // Connect to socket
    socketRef.current = io(config.socketUrl, { path: config.socketPath });

    // Helper to register user online and join room
    const registerUser = () => {
      socketRef.current?.emit("user:online", user._id);
      socketRef.current?.emit("join", user._id);
    };

    // Emit on initial connect
    registerUser();

    // Add connection event listeners for debugging and re-register
    socketRef.current.on("connect", () => {
      registerUser();
      console.log("Chat socket connected:", socketRef.current?.id);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Chat socket connection error:", error);
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("Chat socket disconnected:", reason);
    });

    // Listen for new messages
    socketRef.current.on("chat:receive", (msg: ChatMessage) => {
      if (msg.from === params.userId || msg.to === params.userId) {
        console.log("Received message via socket:", msg);
        setMessages((prev) => {
          // Check if message already exists to prevent duplicates
          const messageExists = prev.some(
            (existingMsg) =>
              existingMsg.from === msg.from &&
              existingMsg.to === msg.to &&
              existingMsg.content === msg.content &&
              Math.abs(
                new Date(existingMsg.createdAt).getTime() -
                  new Date(msg.createdAt).getTime()
              ) < 5000 // Within 5 seconds
          );

          if (messageExists) {
            console.log("Duplicate message detected, not adding");
            return prev;
          }

          // Check if we have a temporary message that should be replaced
          const tempMessageIndex = prev.findIndex(
            (existingMsg) =>
              existingMsg.from === msg.from &&
              existingMsg.to === msg.to &&
              existingMsg.content === msg.content &&
              !existingMsg._id // Temporary messages don't have _id
          );

          if (tempMessageIndex !== -1) {
            // Replace the temporary message with the real one
            const newMessages = [...prev];
            newMessages[tempMessageIndex] = msg;
            return newMessages;
          }

          const newMessages = [...prev, msg];

          // If the new message is from the other user, mark it as read immediately
          if (msg.from === params.userId && msg.to === user?._id) {
            // Mark as read in local state
            const updatedMessages = newMessages.map((m) =>
              m === msg ? { ...m, read: true } : m
            );

            // Send read receipt
            socketRef.current?.emit("chat:read", {
              from: user._id,
              to: params.userId,
            });

            // Mark as read in backend
            markAsRead();

            return updatedMessages;
          }

          return newMessages;
        });
      }
    });

    // Listen for typing indicators
    socketRef.current.on("typing:start", ({ from, to }) => {
      if (from === params.userId && to === user._id) {
        setOtherUserTyping(true);
      }
    });

    socketRef.current.on("typing:stop", ({ from, to }) => {
      if (from === params.userId && to === user._id) {
        setOtherUserTyping(false);
      }
    });

    // Listen for read receipts
    socketRef.current.on("chat:read", ({ from, to }) => {
      // Update messages to mark them as read
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.from === from && msg.to === to) {
            return { ...msg, read: true };
          }
          return msg;
        })
      );
    });

    // Listen for online/offline status updates
    socketRef.current.on("user:online", ({ userId }) => {
      if (userId === params.userId) {
        setIsUserOnline(true);
        setChatUser((prev) => (prev ? { ...prev, isOnline: true } : null));
      }
    });

    socketRef.current.on("user:offline", ({ userId }) => {
      if (userId === params.userId) {
        setIsUserOnline(false);
        setChatUser((prev) => (prev ? { ...prev, isOnline: false } : null));
      }
    });

    // Listen for real-time activity updates from the other user
    socketRef.current.on("user:active", ({ userId }) => {
      if (userId === params.userId) {
        setIsUserOnline(true);
        setChatUser((prev) => (prev ? { ...prev, isOnline: true } : null));
      }
    });

    socketRef.current.on("user:inactive", ({ userId }) => {
      if (userId === params.userId) {
        setIsUserOnline(false);
        setChatUser((prev) => (prev ? { ...prev, isOnline: false } : null));
      }
    });

    // Listen for conversation-specific join/leave events
    socketRef.current.on(
      "user:joined-conversation",
      ({ userId, conversationId }) => {
        if (userId === params.userId && conversationId === user?._id) {
          setIsUserOnline(true);
          setChatUser((prev) => (prev ? { ...prev, isOnline: true } : null));
        }
      }
    );

    // Send read receipt
    socketRef.current.emit("chat:read", {
      from: user._id,
      to: params.userId,
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current?.off("user:online");
      socketRef.current?.off("user:offline");
      socketRef.current?.off("user:active");
      socketRef.current?.off("user:inactive");
      socketRef.current?.off("user:joined-conversation");
      socketRef.current?.off(`chat:receive:${params.userId}`);
    };
  }, [user, token, params.userId, router]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle typing events
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing start if not already typing
    if (!isTyping && value.trim()) {
      setIsTyping(true);
      socketRef.current?.emit("typing:start", {
        from: user?._id,
        to: params.userId,
      });
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketRef.current?.emit("typing:stop", {
        from: user?._id,
        to: params.userId,
      });
    }, 1000);
  };

  const sendMessage = async () => {
    if (!input.trim() || !user || !token) return;

    const messageContent = input.trim();
    setInput("");

    // Stop typing indicator
    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socketRef.current?.emit("typing:stop", {
      from: user._id,
      to: params.userId,
    });

    // Create a temporary message object for immediate display
    const tempMessage: ChatMessage = {
      from: user._id,
      to: params.userId,
      content: messageContent,
      createdAt: new Date().toISOString(),
      read: false,
    };

    // Immediately add the message to the local state for instant feedback
    setMessages((prev) => [...prev, tempMessage]);

    try {
      // Send via REST for persistence - this will also emit the socket event
      const response = await fetch(`${config.apiUrl}/chats/${params.userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: messageContent }),
      });

      if (!response.ok) {
        // If the request failed, remove the temporary message and restore the input
        setMessages((prev) => prev.filter((msg) => msg !== tempMessage));
        setInput(messageContent);
        console.error("Failed to send message");
      } else {
        // If successful, the socket event will update the message with the real data from the server
        // The temporary message will be replaced by the real one from the socket
      }
    } catch (error) {
      // If there's an error, remove the temporary message and restore the input
      setMessages((prev) => prev.filter((msg) => msg !== tempMessage));
      setInput(messageContent);
      console.error("Error sending message:", error);
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSeenStatus = () => {
    const myMessages = messages.filter((msg) => msg.from === user?._id);
    if (myMessages.length === 0) return null;

    const allSeen = myMessages.every((msg) => msg.read);
    const someSeen = myMessages.some((msg) => msg.read);

    if (allSeen) return "Seen";
    if (someSeen) return "Seen";
    return null;
  };

  const getLastSeenTime = () => {
    const myMessages = messages.filter(
      (msg) => msg.from === user?._id && msg.read
    );
    if (myMessages.length === 0) return null;

    const lastSeenMessage = myMessages[myMessages.length - 1];
    return formatTime(lastSeenMessage.createdAt);
  };

  const markAsRead = async () => {
    if (!token) return;

    try {
      await fetch(`${config.apiUrl}/chats/${params.userId}/read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update global unread count
      fetch(`${config.apiUrl}/chats/history`, {
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
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const getUnreadCount = () => {
    return messages.filter((msg) => msg.from === params.userId && !msg.read)
      .length;
  };

  // Emit online status when entering conversation
  useEffect(() => {
    if (socketRef.current && user) {
      // Emit that we're online and active in this specific conversation
      socketRef.current.emit("user:join-conversation", {
        userId: user._id,
        conversationId: params.userId,
      });
    }
  }, [socketRef.current, user, params.userId]);

  // Heartbeat to keep online status active
  useEffect(() => {
    if (!socketRef.current || !user) return;

    const heartbeat = setInterval(() => {
      socketRef.current?.emit("user:heartbeat", {
        userId: user._id,
        timestamp: Date.now(),
      });
    }, 25000); // Send heartbeat every 25 seconds

    return () => clearInterval(heartbeat);
  }, [socketRef.current, user]);

  // Cleanup when leaving conversation
  useEffect(() => {
    return () => {
      if (socketRef.current && user) {
        // Emit that we're leaving the conversation
        socketRef.current.emit("user:leave-conversation", {
          userId: user._id,
          conversationId: params.userId,
        });
      }
    };
  }, [socketRef.current, user, params.userId]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (socketRef.current && user) {
        if (document.hidden) {
          // User switched tabs or minimized browser
          socketRef.current.emit("user:inactive", {
            userId: user._id,
            isActive: false,
          });
        } else {
          // User returned to the tab
          socketRef.current.emit("user:active", {
            userId: user._id,
            isActive: true,
          });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [socketRef.current, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-modern-lg">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
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
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!chatUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-modern-lg">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            User not found
          </h2>
          <p className="text-muted-foreground mb-6">
            The user you're looking for doesn't exist.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors focus-ring"
          >
            Back to Chats
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      {/* Fixed Header */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-card border-b border-border shadow-modern">
        <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Link
              href="/chat"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-ring"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="relative">
                {chatUser.avatar ? (
                  <img
                    src={chatUser.avatar}
                    alt={chatUser.email}
                    className="w-12 h-12 rounded-full object-cover border-2 border-border"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-border flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {chatUser.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${
                    isUserOnline ? "bg-green-500" : "bg-muted-foreground"
                  }`}
                />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  {chatUser.email}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isUserOnline ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getSeenStatus() && (
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <svg
                  className="w-4 h-4 text-primary"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{getSeenStatus()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Container with top padding for fixed header */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-4 overflow-hidden pt-32">
        <div className="bg-card border border-border rounded-2xl h-full flex flex-col shadow-modern-lg">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
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
                  Start a conversation
                </h3>
                <p className="text-muted-foreground">
                  Send a message to begin chatting!
                </p>
              </div>
            ) : (
              messages.map((message, index) => {
                const isOwnMessage = message.from === user?._id;
                return (
                  <div
                    key={index}
                    className={`flex ${
                      isOwnMessage ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        isOwnMessage
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div
                        className={`flex items-center justify-end space-x-1 mt-1 ${
                          isOwnMessage
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        <span className="text-xs">
                          {formatTime(message.createdAt)}
                        </span>
                        {isOwnMessage && (
                          <svg
                            className={`w-3 h-3 ${
                              message.read
                                ? "text-primary-foreground"
                                : "text-primary-foreground/50"
                            }`}
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
                    </div>
                  </div>
                );
              })
            )}

            {/* Typing indicator */}
            {otherUserTyping && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground px-4 py-2 rounded-2xl">
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">
                      typing...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  className="w-full px-4 py-3 bg-background border border-border rounded-full focus-ring placeholder:text-muted-foreground text-foreground pr-12"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus-ring"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
