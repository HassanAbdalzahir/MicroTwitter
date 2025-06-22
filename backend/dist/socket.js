"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = setupSocket;
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Environment variables for URLs
const BASE_URL = process.env.BASE_URL || "server.nanocode.online";
const API_PATH = process.env.API_PATH || "/api/microtwitter";
const FRONTEND_URL = process.env.FRONTEND_URL || `https://${BASE_URL}/apps/microtwitter`;
const SOCKET_CORS_ORIGIN = process.env.SOCKET_CORS_ORIGIN || FRONTEND_URL;
// Keep track of online users
const onlineUsers = new Map(); // userId -> socketId
function setupSocket(httpServer) {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: SOCKET_CORS_ORIGIN,
            methods: ["GET", "POST"],
            credentials: true,
        },
        path: `${API_PATH}/socket.io`,
    });
    io.on("connection", (socket) => {
        // When a user connects, store their socket ID
        socket.on("user:online", (userId) => {
            onlineUsers.set(userId, socket.id);
            // Broadcast to all clients that this user is online
            io.emit("user:status", { userId, status: "online" });
        });
        // When a user disconnects, remove them from online users
        socket.on("disconnect", () => {
            let disconnectedUserId;
            for (const [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    disconnectedUserId = userId;
                    break;
                }
            }
            if (disconnectedUserId) {
                onlineUsers.delete(disconnectedUserId);
                io.emit("user:status", {
                    userId: disconnectedUserId,
                    status: "offline",
                });
            }
        });
        // Handle chat messages
        socket.on("chat:send", (data) => {
            const recipientSocketId = onlineUsers.get(data.to);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit("chat:receive", data);
            }
        });
        // Handle typing indicators
        socket.on("chat:typing", (data) => {
            const recipientSocketId = onlineUsers.get(data.to);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit("chat:typing", data);
            }
        });
        // Handle read receipts
        socket.on("chat:read", (data) => {
            const recipientSocketId = onlineUsers.get(data.from);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit("chat:read", data);
            }
        });
    });
    return io;
}
