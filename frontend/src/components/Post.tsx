import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { config } from "../config/env";

interface PostProps {
  name: string;
  time: string;
  content: string;
  avatar?: string;
  likes: number;
  liked: boolean;
  postId: string;
  onLike: () => void;
  onUnlike: () => void;
}

export default function Post({
  name,
  time,
  content,
  avatar,
  likes,
  liked,
  postId,
  onLike,
  onUnlike,
}: PostProps) {
  const { user, token } = useAuth();
  const [likeLoading, setLikeLoading] = useState(false);

  const handleLike = async () => {
    if (!user || !token || likeLoading) return;
    setLikeLoading(true);
    const res = await fetch(
      `${config.apiUrl}/posts/${postId}/${liked ? "unlike" : "like"}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (res.ok) {
      liked ? onUnlike() : onLike();
    }
    setLikeLoading(false);
  };

  return (
    <div className="group relative bg-card border border-border rounded-xl p-6 hover:shadow-modern-lg transition-all duration-300 animate-fade-in">
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt={`${name}'s avatar`}
              className="w-12 h-12 rounded-full object-cover border-2 border-border hover:border-primary/50 transition-colors"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-border flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
              {name}
            </span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {time}
            </span>
          </div>
          <div className="text-foreground leading-relaxed whitespace-pre-wrap">
            {content}
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 focus-ring">
            <svg
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 20 20"
              className="w-5 h-5"
            >
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Interactive elements */}
      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border/50">
        <button
          className={`flex items-center gap-2 transition-colors group ${
            liked ? "text-primary" : "text-muted-foreground hover:text-primary"
          }`}
          onClick={handleLike}
          disabled={!user || likeLoading}
        >
          <svg
            className={`w-5 h-5 group-hover:scale-110 transition-transform ${
              liked ? "fill-primary stroke-primary" : "fill-none stroke-current"
            }`}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span className="text-sm font-medium">
            {likes} Like{likes !== 1 ? "s" : ""}
          </span>
        </button>

        <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
          <svg
            className="w-5 h-5 group-hover:scale-110 transition-transform"
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
          <span className="text-sm font-medium">Reply</span>
        </button>

        <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
          <svg
            className="w-5 h-5 group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
            />
          </svg>
          <span className="text-sm font-medium">Share</span>
        </button>
      </div>
    </div>
  );
}
