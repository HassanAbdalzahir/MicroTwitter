import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { validationResult } from "express-validator";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const register = async (req: Request, res: Response): Promise<void> => {
  const error = validationResult(req);
  try {
    const { email, password, username, avatar } = req.body;
    if (!error.isEmpty()) {
      res.status(400).json({ errors: error.array() });
      return;
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      avatar,
      username,
      password: hashed,
    });
    const token = jwt.sign(
      { userId: user._id, email: user.email, username: user.username },
      JWT_SECRET!,
      { expiresIn: "30d" }
    );

    res.status(201).json({
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Registration failed" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const error = validationResult(req);
  try {
    if (!error.isEmpty()) {
      res.status(400).json({ errors: error.array() });
      return;
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({ error: "User not found" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(400).json({ error: "password is wrong" });
      return;
    }
    const token = jwt.sign(
      { userId: user._id, email: user.email, username: user.username },
      JWT_SECRET!,
      { expiresIn: "30d" }
    );

    res.json({
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};
