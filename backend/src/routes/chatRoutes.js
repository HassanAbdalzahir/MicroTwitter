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
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Chat_1 = __importDefault(require("../models/Chat"));
const User_1 = __importDefault(require("../models/User"));
const mongoose_1 = __importDefault(require("mongoose"));
const router = express_1.default.Router();
// Get chat history with all users - MUST be before /:userId route
router.get("/history", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }
        const userId = req.user._id;
        const io = req.app.get("io");
        // Get all unique users the current user has chatted with
        const chats = yield Chat_1.default.aggregate([
            {
                $match: {
                    $or: [{ from: userId }, { to: userId }],
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $group: {
                    _id: {
                        $cond: [{ $eq: ["$from", userId] }, "$to", "$from"],
                    },
                    lastMessage: { $first: "$$ROOT" },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ["$to", userId] }, { $eq: ["$read", false] }] },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
        ]);
        // Get user details for each chat
        const userIds = chats.map((chat) => chat._id);
        const users = yield User_1.default.find({ _id: { $in: userIds } }, { email: 1, avatar: 1 }).lean();
        // Get online users from socket
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
        // Combine user details with last message and online status
        const chatHistory = chats.map((chat) => {
            const user = users.find((u) => u._id.toString() === chat._id.toString());
            const userIdString = chat._id.toString();
            const isOnline = onlineUsers.has(userIdString);
            return {
                _id: user === null || user === void 0 ? void 0 : user._id,
                email: user === null || user === void 0 ? void 0 : user.email,
                avatar: user === null || user === void 0 ? void 0 : user.avatar,
                isOnline,
                unreadCount: chat.unreadCount || 0,
                lastMessage: chat.lastMessage
                    ? {
                        content: chat.lastMessage.content,
                        timestamp: chat.lastMessage.createdAt,
                        read: chat.lastMessage.read,
                    }
                    : undefined,
            };
        });
        res.json(chatHistory);
    }
    catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ message: "Error fetching chat history" });
    }
}));
// Mark messages as read - MUST be before /:userId route
router.post("/:userId/read", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }
        // Validate that the user ID is valid
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.userId)) {
            res.status(400).json({ message: "Invalid user ID" });
            return;
        }
        const from = new mongoose_1.default.Types.ObjectId(req.params.userId);
        const to = req.user._id;
        yield Chat_1.default.updateMany({
            from,
            to,
            read: false,
        }, {
            $set: { read: true },
        });
        // Emit read receipt via socket
        const io = req.app.get("io");
        io.to(from.toString()).to(to.toString()).emit("chat:read", {
            from: from.toString(),
            to: to.toString(),
        });
        res.json({ message: "Messages marked as read" });
    }
    catch (error) {
        console.error("Error marking messages as read:", error);
        res.status(500).json({ message: "Error marking messages as read" });
    }
}));
// Get chat messages with a specific user
router.get("/:userId", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }
        // Validate that the user ID is valid
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.userId)) {
            res.status(400).json({ message: "Invalid user ID" });
            return;
        }
        const userId = req.user._id;
        const otherUserId = new mongoose_1.default.Types.ObjectId(req.params.userId);
        const messages = yield Chat_1.default.find({
            $or: [
                { from: userId, to: otherUserId },
                { from: otherUserId, to: userId },
            ],
        })
            .sort({ createdAt: 1 })
            .lean();
        // Mark messages from the other user as read
        yield Chat_1.default.updateMany({
            from: otherUserId,
            to: userId,
            read: false,
        }, {
            $set: { read: true },
        });
        // Emit read receipt via socket
        const io = req.app.get("io");
        io.to(otherUserId.toString()).to(userId.toString()).emit("chat:read", {
            from: otherUserId.toString(),
            to: userId.toString(),
        });
        res.json(messages);
    }
    catch (error) {
        console.error("Error fetching chat messages:", error);
        res.status(500).json({ message: "Error fetching chat messages" });
    }
}));
// Send a message
router.post("/:userId", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }
        // Validate that the user ID is valid
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.userId)) {
            res.status(400).json({ message: "Invalid user ID" });
            return;
        }
        const from = req.user._id;
        const to = new mongoose_1.default.Types.ObjectId(req.params.userId);
        const { content } = req.body;
        if (!(content === null || content === void 0 ? void 0 : content.trim())) {
            res.status(400).json({ message: "Message content is required" });
            return;
        }
        const message = new Chat_1.default({
            from,
            to,
            content: content.trim(),
        });
        yield message.save();
        // Emit the message via socket
        const io = req.app.get("io");
        io.to(from.toString())
            .to(to.toString())
            .emit("chat:receive", Object.assign(Object.assign({}, message.toObject()), { from: from.toString(), to: to.toString() }));
        res.status(201).json(message);
    }
    catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Error sending message" });
    }
}));
exports.default = router;
