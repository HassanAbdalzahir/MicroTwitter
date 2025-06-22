"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = setupSocket;
const socket_io_1 = require("socket.io");
// Keep track of online users
const onlineUsers = new Map(); // userId -> socketId
function setupSocket(httpServer) {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
        },
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
