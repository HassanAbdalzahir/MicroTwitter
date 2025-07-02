"use client";

import { useAuth } from "../../context/AuthContext";
import { useState, useRef } from "react";
import Link from "next/link";
import { config } from "../../config/env";

export default function ProfilePage() {
  const { user, token } = useAuth();
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [preview, setPreview] = useState(user?.avatar || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Authentication Required
          </h2>
          <p className="text-muted-foreground mb-6">
            Please log in to view your profile.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors focus-ring"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!preview || !token) return;
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${config.apiUrl}/auth/avatar`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatar: preview }),
      });
      const data = await res.json();
      if (res.ok) {
        setAvatar(data.avatar);
        setMessage("Avatar updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to update avatar");
      }
    } catch (error) {
      setMessage("Error updating avatar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-modern-lg animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
            <p className="text-muted-foreground">
              Manage your account settings
            </p>
          </div>

          {/* Profile Info */}
          <div className="space-y-8">
            {/* Avatar Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                Profile Picture
              </h2>
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 rounded-full border-4 border-border overflow-hidden bg-muted flex items-center justify-center">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      className="w-12 h-12 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors focus-ring"
                  >
                    Choose New Image
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {preview !== avatar && (
                    <button
                      onClick={handleUpload}
                      disabled={loading}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-ring"
                    >
                      {loading ? "Updating..." : "Save Changes"}
                    </button>
                  )}
                </div>
              </div>
              {message && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    message.includes("successfully")
                      ? "bg-green-500/10 border border-green-500/20 text-green-600"
                      : "bg-destructive/10 border border-destructive/20 text-destructive"
                  }`}
                >
                  {message}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                Account Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Username
                  </label>
                  <div className="p-3 bg-muted rounded-lg text-foreground">
                    {user.username}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <div className="p-3 bg-muted rounded-lg text-foreground">
                    {user.email}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Member Since
                  </label>
                  <div className="p-3 bg-muted rounded-lg text-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    User ID
                  </label>
                  <div className="p-3 bg-muted rounded-lg text-foreground font-mono text-sm">
                    {user._id}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Actions</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/"
                  className="flex-1 px-4 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors focus-ring text-center"
                >
                  Back to Home
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 px-4 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors focus-ring"
                >
                  Refresh Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
