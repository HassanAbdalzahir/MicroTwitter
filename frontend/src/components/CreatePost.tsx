import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { config } from "../config/env";

export default function CreatePost({ onPost }: { onPost: () => void }) {
  const { user, token } = useAuth();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!content.trim() || !token || !user) return;
    setLoading(true);
    await fetch(`${config.apiUrl}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content, name: user.email }),
    });
    setContent("");
    setLoading(false);
    onPost();
  };

  if (!user) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 mb-6 text-center">
        <div className="flex items-center justify-center space-x-2 text-muted-foreground">
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
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>Please log in to create a post.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 mb-6 shadow-modern animate-fade-in">
      <div className="flex items-start space-x-4">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={`${user.username || user.email}'s avatar`}
              className="w-12 h-12 rounded-full object-cover border-2 border-border"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-border flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {(user.username || user.email || "U").charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Post Form */}
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            className="w-full min-h-[120px] p-4 bg-background border border-border rounded-lg resize-none focus-ring placeholder:text-muted-foreground text-foreground"
            maxLength={280}
          />

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              {/* Character count */}
              <span
                className={`text-sm ${
                  content.length > 260
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
              >
                {content.length}/280
              </span>

              {/* Post actions */}
              <div className="flex items-center space-x-2">
                <button className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-accent transition-all duration-200 focus-ring">
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
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </button>

                <button className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-accent transition-all duration-200 focus-ring">
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
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>

                <button className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-accent transition-all duration-200 focus-ring">
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
                      d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Post button */}
            <button
              onClick={handlePost}
              disabled={!content.trim() || loading}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus-ring shadow-modern"
            >
              {loading ? (
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
                  <span>Posting...</span>
                </div>
              ) : (
                "Post"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
