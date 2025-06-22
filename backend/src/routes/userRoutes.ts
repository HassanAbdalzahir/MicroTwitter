import { Router } from "express";
import User from "../models/User";
import { authenticateToken, requireAuth } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserSearchResult:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: User ID
 *         username:
 *           type: string
 *           description: Username
 *         avatar:
 *           type: string
 *           description: User's avatar URL
 *         email:
 *           type: string
 *           description: User's email
 *         isOnline:
 *           type: boolean
 *           description: Whether the user is currently online
 *     UserProfile:
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
 */

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Search users by username
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username to search for (partial match)
 *         example: "john"
 *     responses:
 *       200:
 *         description: List of users matching the search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserSearchResult'
 *       400:
 *         description: Bad request - Username query required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
// Search users by username (partial match)
router.get("/search", requireAuth, async (req, res) => {
  const { username } = req.query;
  if (!username || typeof username !== "string") {
    res.status(400).json({ error: "Username query required" });
    return;
  }

  const users = await User.find({
    username: { $regex: username, $options: "i" },
  })
    .select("_id username avatar email")
    .limit(10);

  // Get online users from socket
  const io = req.app.get("io");
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

  // Add online status to users
  const usersWithOnlineStatus = users.map((user: any) => ({
    ...user.toObject(),
    isOnline: onlineUsers.has(user._id.toString()),
  }));

  res.json(usersWithOnlineStatus);
});

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to retrieve
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found
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
// Get user by ID
router.get("/:userId", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("email avatar");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Error fetching user" });
  }
});

export default router;
