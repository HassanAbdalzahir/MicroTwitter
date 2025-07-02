import { Request, Response } from "express";
import Post from "../models/Post";
import { AuthRequest } from "../middleware/auth";
import mongoose from "mongoose";

export const getPosts = async (req: Request, res: Response) => {
  try {
    // Get all posts and populate user
    const posts = await Post.find().sort({ createdAt: -1 }).populate("user");
    // Get current user id if available
    const userId = (req as any).user
      ? ((req as any).user._id || (req as any).user.userId).toString()
      : null;
    // Map to include avatar, username, like count, and liked status
    const postsWithAvatars = posts.map((post: any) => {
      const likesArr = (post.likes || []).map((id: any) => id.toString());
      return {
        _id: post._id,
        name: post.user?.username || post.name,
        content: post.content,
        avatar: post.user?.avatar || post.avatar || "",
        createdAt: post.createdAt,
        likes: likesArr.length,
        liked: userId ? likesArr.includes(userId) : false,
      };
    });
    console.log("getPosts response:", postsWithAvatars);
    res.json(postsWithAvatars);
  } catch (err) {
    console.error("Error in getPosts:", err);
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

export const likePost = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const postId = req.params.postId;
    const userId = (
      (req.user as any)._id || (req.user as any).userId
    ).toString();
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    console.log("userId:", userId, "type:", typeof userId);
    console.log("post.likes before:", post.likes, "type:", typeof post.likes);
    if (!Array.isArray(post.likes)) post.likes = [];
    const likesArr = post.likes.map((id: any) => id.toString());
    if (likesArr.includes(userId)) {
      res.status(400).json({ error: "Already liked" });
      return;
    }
    post.likes.push(new mongoose.Types.ObjectId(userId));
    console.log("post.likes after push:", post.likes);
    post.markModified("likes");
    await post.save();
    console.log("post.likes after save:", post.likes);
    res.json({ likes: post.likes.length, liked: true });
  } catch (err) {
    console.error("Error in likePost:", err);
    res.status(500).json({ error: "Failed to like post" });
  }
};

export const unlikePost = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const postId = req.params.postId;
    const userId = (
      (req.user as any)._id || (req.user as any).userId
    ).toString();
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    if (!Array.isArray(post.likes)) post.likes = [];
    post.likes = post.likes.filter((id: any) => id.toString() !== userId);
    post.markModified("likes");
    await post.save();
    res.json({ likes: post.likes.length, liked: false });
  } catch (err) {
    console.error("Error in unlikePost:", err);
    res.status(500).json({ error: "Failed to unlike post" });
  }
};
