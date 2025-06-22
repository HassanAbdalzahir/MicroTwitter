"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const morgan_1 = __importDefault(require("morgan"));
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const socket_io_1 = require("socket.io");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const postsRoutes_1 = __importDefault(require("./routes/postsRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const mongoUri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/microtwitter";

// Environment variables for URLs
const BASE_URL = process.env.BASE_URL || "server.nanocode.online";
const API_PATH = process.env.API_PATH || "/api/microtwitter";
const FRONTEND_URL =
  process.env.FRONTEND_URL || `https://${BASE_URL}/apps/microtwitter`;
const SOCKET_CORS_ORIGIN = process.env.SOCKET_CORS_ORIGIN || FRONTEND_URL;
const CORS_ORIGIN = process.env.CORS_ORIGIN || `https://${BASE_URL}`;

// Middlewares
app.use(express_1.default.json({ limit: "10mb" }));
app.use(
  (0, cors_1.default)({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);
app.use((0, morgan_1.default)("dev"));

// Routes with API path prefix
app.use(`${API_PATH}/auth`, authRoutes_1.default);
app.use(`${API_PATH}/posts`, postsRoutes_1.default);
app.use(`${API_PATH}/users`, userRoutes_1.default);
app.use(`${API_PATH}/chats`, chatRoutes_1.default);

// server
const server = http_1.default.createServer(app);

// Socket.io setup with proper CORS configuration
const io = new socket_io_1.Server(server, {
  cors: {
    origin: SOCKET_CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
  path: `${API_PATH}/socket.io`,
});

// Make io accessible to routes
app.set("io", io);

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  let currentUserId = null;
  // Join user's room
  socket.on("join", (userId) => {
    currentUserId = userId;
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
    // Broadcast that user is online
    socket.broadcast.emit("user:online", { userId });
  });
  // Handle typing indicators
  socket.on("typing:start", ({ from, to }) => {
    io.to(to).emit("typing:start", { from, to });
  });
  socket.on("typing:stop", ({ from, to }) => {
    io.to(to).emit("typing:stop", { from, to });
  });
  // Handle read receipts
  socket.on("chat:read", ({ from, to }) => {
    io.to(from).to(to).emit("chat:read", { from, to });
  });
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // Broadcast that user is offline
    if (currentUserId) {
      socket.broadcast.emit("user:offline", { userId: currentUserId });
    }
  });
});

// Connect To Mongo DB
mongoose_1.default
  .connect(mongoUri)
  .then(() => {
    console.log(`⚓⚓ Database Connected 🚢🚢`);
    server.listen(PORT, () => {
      console.log(`🚀🚀 Server Running At Port: ${PORT} 🚀🚀`);
      console.log(`📡 API Base URL: https://${BASE_URL}${API_PATH}`);
      console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
      console.log(`🔌 Socket.io Path: ${API_PATH}/socket.io`);
    });
  })
  .catch((err) => console.log(err));
