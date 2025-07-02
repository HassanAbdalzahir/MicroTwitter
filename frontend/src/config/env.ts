// Environment configuration for MicroTwitter frontend

export const config = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",

  // Socket.IO Configuration
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000",

  // Socket.IO Path Configuration
  socketPath:
    process.env.NEXT_PUBLIC_SOCKET_PATH || "/api/microtwitter/socket.io",

  // App Configuration
  appName: process.env.NEXT_PUBLIC_APP_NAME || "MicroTwitter",
  appDescription:
    process.env.NEXT_PUBLIC_APP_DESCRIPTION || "A microblogging platform",

  // Environment
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",

  // Feature Flags
  enableChat: process.env.NEXT_PUBLIC_ENABLE_CHAT !== "false", // enabled by default
  enableNotifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS !== "false", // enabled by default
  enableAvatarUpload: process.env.NEXT_PUBLIC_ENABLE_AVATAR_UPLOAD !== "false", // enabled by default

  // Analytics (optional)
  analyticsId: process.env.NEXT_PUBLIC_ANALYTICS_ID,
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
} as const;

// Type-safe environment variables
export type Config = typeof config;
