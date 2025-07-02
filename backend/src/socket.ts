import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
import dotenv from "dotenv";

dotenv.config();

// Environment variables for URLs
const FRONTEND_URL = "http://localhost:4004";
const SOCKET_CORS_ORIGIN = FRONTEND_URL;

// Keep track of online users
const onlineUsers = new Map<string, Set<string>>();

export default function setupSocket(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: SOCKET_CORS_ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    let currentUserId: string | null = null;

    // Register user as online
    socket.on("user:online", (userId: string) => {
      currentUserId = userId;

      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
        io.emit("user:status", { userId, status: "online" }); // Notify all
      }

      onlineUsers.get(userId)?.add(socket.id);
    });

    // Join user's private room
    socket.on("join", (userId: string) => {
      currentUserId = userId;
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    });

    // Typing indicators
    socket.on("typing:start", ({ from, to }) => {
      io.to(to).emit("typing:start", { from, to });
    });

    socket.on("typing:stop", ({ from, to }) => {
      io.to(to).emit("typing:stop", { from, to });
    });

    // Chat message
    socket.on("chat:send", (data) => {
      const recipients = onlineUsers.get(data.to);
      if (recipients) {
        for (const socketId of recipients) {
          io.to(socketId).emit("chat:receive", data);
        }
      }
    });

    // Typing
    socket.on("chat:typing", (data) => {
      const recipients = onlineUsers.get(data.to);
      if (recipients) {
        for (const socketId of recipients) {
          io.to(socketId).emit("chat:typing", data);
        }
      }
    });

    // Read
    socket.on("chat:read", ({ from, to }) => {
      const recipients = onlineUsers.get(from);
      if (recipients) {
        for (const socketId of recipients) {
          io.to(socketId).emit("chat:read", { from, to });
        }
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      if (currentUserId) {
        const sockets = onlineUsers.get(currentUserId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            onlineUsers.delete(currentUserId);
            io.emit("user:status", {
              userId: currentUserId,
              status: "offline",
            });
          }
        }
      }
    });
  });

  return io;
}
