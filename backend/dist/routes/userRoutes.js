"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Search users by username (partial match)
router.get("/search", auth_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.query;
    if (!username || typeof username !== "string") {
        res.status(400).json({ error: "Username query required" });
        return;
    }
    const users = yield User_1.default.find({
        username: { $regex: username, $options: "i" },
    })
        .select("_id username avatar email")
        .limit(10);
    // Get online users from socket
    const io = req.app.get("io");
    const onlineUsers = new Set();
    if (io) {
        const sockets = yield io.fetchSockets();
        for (const socket of sockets) {
            // Get the user ID from the socket's rooms (excluding socket.id)
            const rooms = Array.from(socket.rooms);
            const userRoom = rooms.find((room) => room !== socket.id);
            if (userRoom) {
                onlineUsers.add(userRoom);
            }
        }
    }
    // Add online status to users
    const usersWithOnlineStatus = users.map((user) => (Object.assign(Object.assign({}, user.toObject()), { isOnline: onlineUsers.has(user._id.toString()) })));
    res.json(usersWithOnlineStatus);
}));
// Get user by ID
router.get("/:userId", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.params.userId).select("email avatar");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json(user);
    }
    catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Error fetching user" });
    }
}));
exports.default = router;
