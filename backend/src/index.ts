import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import morgan from "morgan";
import http from "http";
import dotenv from "dotenv";
import { Server as SocketIOServer } from "socket.io";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger";

import authRoutes from "./routes/authRoutes";
import postsRouter from "./routes/postsRoutes";
import userRoutes from "./routes/userRoutes";
import chatRoutes from "./routes/chatRoutes";

dotenv.config();

const app = express();
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
app.use(express.json({ limit: "10mb" }));
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);
app.use(morgan("dev"));

// Routes with API path prefix
app.use(`${API_PATH}/auth`, authRoutes);
app.use(`${API_PATH}/posts`, postsRouter);
app.use(`${API_PATH}/users`, userRoutes);
app.use(`${API_PATH}/chats`, chatRoutes);

// Swagger UI setup
app.use(`${API_PATH}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// server
const server = http.createServer(app);

// Socket.io setup with proper CORS configuration
const io = new SocketIOServer(server, {
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
  let currentUserId: string | null = null;

  // Join user's room
  socket.on("join", (userId: string) => {
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
mongoose
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
