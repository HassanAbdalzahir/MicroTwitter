import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import morgan from "morgan";
import http from "http";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger";
import setupSocket from "./socket";

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
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const CORS_ORIGIN = process.env.CORS_ORIGIN || `https://${BASE_URL}`;
const SOCKET_CORS_ORIGIN = process.env.SOCKET_CORS_ORIGIN || FRONTEND_URL;

// Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);
app.use(morgan("dev"));

// Routes without API path prefix
app.use("/auth", authRoutes);
app.use("/posts", postsRouter);
app.use("/users", userRoutes);
app.use("/chats", chatRoutes);

// Swagger UI setup
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// server
const server = http.createServer(app);

// Socket.io setup with proper CORS configuration
import { Server } from "socket.io";
const io = new Server(server, {
  cors: {
    origin: SOCKET_CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
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
      console.log(`📡 API Base URL: http://localhost:${PORT}`);
      console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
      console.log(`🔌 Socket.io Path: /socket.io`);
    });
  })
  .catch((err) => console.log(err));
