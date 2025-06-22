import { Request, Response } from "express";
import Post from "../models/Post";
import { AuthRequest } from "../middleware/auth";

export const getPosts = async (req: Request, res: Response) => {
  try {
    // Get all posts and populate user
    const posts = await Post.find().sort({ createdAt: -1 }).populate("user");
    // Map to include avatar and username
    const postsWithAvatars = posts.map((post: any) => ({
      _id: post._id,
      name: post.user?.username || post.name,
      content: post.content,
      avatar: post.user?.avatar || post.avatar || "",
      createdAt: post.createdAt,
    }));
    res.json(postsWithAvatars);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};

export const createPost = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const { content } = req.body;
    if (!content) {
      res.status(400).json({ error: "Content is required" });
      return;
    }
    // Find the user to get _id
    const User = (await import("../models/User")).default;
    const userDoc = await User.findOne({ email: req.user.email });
    if (!userDoc) {
      res.status(400).json({ error: "User not found" });
      return;
    }
    const post = await Post.create({
      name: userDoc.username,
      content,
      avatar: userDoc.avatar,
      user: userDoc._id,
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to create post" });
  }
};
