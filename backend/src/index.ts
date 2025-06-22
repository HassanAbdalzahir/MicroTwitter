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
const PORT = process.env.PORT;
const mongoUri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/microtwitter";

// Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(cors());
app.use(morgan("dev"));

// Routes
app.use("/api/auth/", authRoutes);
app.use("/api/posts", postsRouter);
app.use("/api/users", userRoutes);
app.use("/api/chats/", chatRoutes);

// Swagger UI setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// server
const server = http.createServer(app);

//sociket io setup
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
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
    server.listen(PORT, () =>
      console.log(`🚀🚀 Server Running At Port: ${PORT} 🚀🚀`)
    );
  })
  .catch((err) => console.log(err));
