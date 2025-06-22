#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🚀 MicroTwitter Backend Environment Setup 🚀\n");

// Default environment variables
const defaultEnv = `# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/microtwitter

# Domain Configuration
BASE_URL=server.nanocode.online
API_PATH=/api/microtwitter
FRONTEND_PATH=/apps/microtwitter

# Frontend URL (for CORS and Socket.io)
FRONTEND_URL=https://server.nanocode.online/apps/microtwitter

# API Base URL
API_BASE_URL=https://server.nanocode.online/api/microtwitter

# Socket.io Configuration
SOCKET_CORS_ORIGIN=https://server.nanocode.online/apps/microtwitter

# JWT Configuration
JWT_SECRET=your_jwt_secret_here_change_this_in_production
JWT_EXPIRES_IN=7d

# Other configurations
CORS_ORIGIN=https://server.nanocode.online
`;

const envPath = path.join(__dirname, ".env");

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log("⚠️  .env file already exists!");
  console.log(
    "📝 You can manually edit it or delete it to create a new one.\n"
  );

  const currentEnv = fs.readFileSync(envPath, "utf8");
  console.log("Current .env content:");
  console.log("─".repeat(50));
  console.log(currentEnv);
  console.log("─".repeat(50));
} else {
  // Create .env file
  fs.writeFileSync(envPath, defaultEnv);
  console.log("✅ .env file created successfully!");
  console.log(
    "📝 Please edit the .env file with your specific configuration.\n"
  );

  console.log("🔧 Key configurations to update:");
  console.log("   • MONGODB_URI - Your MongoDB connection string");
  console.log("   • JWT_SECRET - A secure random string for JWT signing");
  console.log("   • BASE_URL - Your domain (e.g., server.nanocode.online)");
  console.log("   • FRONTEND_URL - Your frontend application URL");
  console.log("   • API_PATH - API path prefix (default: /api/microtwitter)");
}

console.log("\n📚 For more information, check the README.md file");
console.log('🚀 Run "npm run dev" to start the development server');
