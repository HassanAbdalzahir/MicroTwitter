import express from "express";
import { authenticateToken } from "../middleware/auth";
import Chat from "../models/Chat";
import User, { IUser } from "../models/User";
import mongoose from "mongoose";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ChatMessage:
 *       type: object
 *       required:
 *         - from
 *         - to
 *         - content
 *       properties:
 *         _id:
 *           type: string
 *           description: Message ID
 *         from:
 *           type: string
 *           description: Sender user ID
 *         to:
 *           type: string
 *           description: Recipient user ID
 *         content:
 *           type: string
 *           description: Message content
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Message creation timestamp
 *         read:
 *           type: boolean
 *           description: Whether the message has been read
 *     ChatHistoryItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: User ID
 *         email:
 *           type: string
 *           description: User's email
 *         avatar:
 *           type: string
 *           description: User's avatar URL
 *         isOnline:
 *           type: boolean
 *           description: Whether the user is currently online
 *         unreadCount:
 *           type: number
 *           description: Number of unread messages from this user
 *         lastMessage:
 *           type: object
 *           properties:
 *             content:
 *               type: string
 *             timestamp:
 *               type: string
 *               format: date-time
 *             read:
 *               type: boolean
 *     SendMessageRequest:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           description: Message content
 *           example: "Hello! How are you?"
 */

/**
 * @swagger
 * /api/chats/history:
 *   get:
 *     summary: Get chat history with all users
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve chat history with all users the current user has chatted with, including last message and unread count
 *     responses:
 *       200:
 *         description: Chat history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ChatHistoryItem'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /api/chats/{userId}/read:
 *   post:
 *     summary: Mark messages as read
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID whose messages to mark as read
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Messages marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request - Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /api/chats/{userId}:
 *   get:
 *     summary: Get chat messages with a specific user
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to get chat messages with
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Chat messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ChatMessage'
 *       400:
 *         description: Bad request - Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *   post:
 *     summary: Send a message to a specific user
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to send message to
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendMessageRequest'
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatMessage'
 *       400:
 *         description: Bad request - Invalid user ID or missing content
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

// Get chat history with all users - MUST be before /:userId route
router.get("/history", authenticateToken, async (req, res) => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const userId = req.user._id;
    const io = req.app.get("io");

    // Get all unique users the current user has chatted with
    const chats = await Chat.aggregate([
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
    const users = await User.find(
      { _id: { $in: userIds } },
      { email: 1, avatar: 1 }
    ).lean();

    // Get online users from socket
    const onlineUsers = new Set<string>();
    if (io) {
      const sockets = await io.fetchSockets();
      for (const socket of sockets) {
        // Get the user ID from the socket's rooms (excluding socket.id)
        const rooms = Array.from(socket.rooms);
        const userRoom = rooms.find((room) => room !== socket.id) as
          | string
          | undefined;
        if (userRoom) {
          onlineUsers.add(userRoom);
        }
      }
    }

    // Combine user details with last message and online status
    const chatHistory = chats.map((chat: any) => {
      const user = users.find(
        (u) =>
          (u._id as mongoose.Types.ObjectId).toString() === chat._id.toString()
      ) as IUser | undefined;

      const userIdString = chat._id.toString();
      const isOnline = onlineUsers.has(userIdString);

      return {
        _id: user?._id,
        email: user?.email,
        avatar: user?.avatar,
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
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ message: "Error fetching chat history" });
  }
});

// Mark messages as read - MUST be before /:userId route
router.post("/:userId/read", authenticateToken, async (req, res) => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Validate that the user ID is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    const from = new mongoose.Types.ObjectId(req.params.userId);
    const to = req.user._id;

    await Chat.updateMany(
      {
        from,
        to,
        read: false,
      },
      {
        $set: { read: true },
      }
    );

    // Emit read receipt via socket
    const io = req.app.get("io");
    io.to(from.toString()).to(to.toString()).emit("chat:read", {
      from: from.toString(),
      to: to.toString(),
    });

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Error marking messages as read" });
  }
});

// Get chat messages with a specific user
router.get("/:userId", authenticateToken, async (req, res) => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Validate that the user ID is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    const userId = req.user._id;
    const otherUserId = new mongoose.Types.ObjectId(req.params.userId);

    const messages = await Chat.find({
      $or: [
        { from: userId, to: otherUserId },
        { from: otherUserId, to: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    // Mark messages from the other user as read
    await Chat.updateMany(
      {
        from: otherUserId,
        to: userId,
        read: false,
      },
      {
        $set: { read: true },
      }
    );

    // Emit read receipt via socket
    const io = req.app.get("io");
    io.to(otherUserId.toString()).to(userId.toString()).emit("chat:read", {
      from: otherUserId.toString(),
      to: userId.toString(),
    });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({ message: "Error fetching chat messages" });
  }
});

// Send a message
router.post("/:userId", authenticateToken, async (req, res) => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Validate that the user ID is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    const from = req.user._id;
    const to = new mongoose.Types.ObjectId(req.params.userId);
    const { content } = req.body;

    if (!content?.trim()) {
      res.status(400).json({ message: "Message content is required" });
      return;
    }

    const message = new Chat({
      from,
      to,
      content: content.trim(),
    });

    await message.save();

    // Emit the message via socket
    const io = req.app.get("io");
    io.to(from.toString())
      .to(to.toString())
      .emit("chat:receive", {
        ...message.toObject(),
        from: from.toString(),
        to: to.toString(),
      });

    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Error sending message" });
  }
});

export default router;
