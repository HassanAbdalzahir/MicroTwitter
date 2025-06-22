"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import ChatHistory from "../../components/ChatHistory";
import { useRouter } from "next/navigation";
import { config } from "../../config/env";

interface User {
  _id: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
}

export default function ChatPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim() || !token) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `${config.apiUrl}/api/users/search?username=${encodeURIComponent(
          searchQuery
        )}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const startChat = (userId: string) => {
    router.push(`/chat/${userId}`);
    setShowNewChat(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  if (!user) {
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">Chat</h1>
          <p className="text-muted-foreground">
            Please log in to access the chat feature.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card border border-border rounded-2xl shadow-modern-lg animate-fade-in">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-primary"
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
              <h1 className="text-2xl font-bold text-foreground">Messages</h1>
            </div>
            <button
              onClick={() => setShowNewChat(true)}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all duration-200 focus-ring shadow-modern"
            >
              New Chat
            </button>
          </div>

          {/* New Chat Modal */}
          {showNewChat && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-modern-lg animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-foreground">
                    Start New Chat
                  </h2>
                  <button
                    onClick={() => {
                      setShowNewChat(false);
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="flex gap-3 mb-6">
                  <div className="flex-1 relative">
                    <svg
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      placeholder="Search users by email..."
                      className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus-ring placeholder:text-muted-foreground text-foreground"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus-ring shadow-modern"
                  >
                    {isSearching ? (
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-4 h-4 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Searching...</span>
                      </div>
                    ) : (
                      "Search"
                    )}
                  </button>
                </div>

                {searchResults.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {searchResults.map((result) => (
                      <button
                        key={result._id}
                        onClick={() => startChat(result._id)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-accent rounded-lg transition-all duration-200 focus-ring group"
                      >
                        <div className="relative">
                          {result.avatar ? (
                            <img
                              src={result.avatar}
                              alt={result.email}
                              className="w-12 h-12 rounded-full object-cover border-2 border-border group-hover:border-primary/50 transition-colors"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-border flex items-center justify-center group-hover:border-primary/50 transition-colors">
                              <span className="text-lg font-semibold text-primary">
                                {result.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          {/* Online indicator */}
                          <div
                            className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-card ${
                              result.isOnline
                                ? "bg-green-500"
                                : "bg-muted-foreground"
                            }`}
                          />
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {result.email}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {result.isOnline ? "Online" : "Offline"}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : searchQuery && !isSearching ? (
                  <div className="text-center py-8">
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
                          d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </div>
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          <ChatHistory />
        </div>
      </div>
    </div>
  );
}
