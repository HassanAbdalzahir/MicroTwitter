import { Router } from "express";
import { body } from "express-validator";
import User from "../models/User";
import { login, register } from "../controllers/authControllers";
const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - username
 *         - password
 *         - avatar
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         username:
 *           type: string
 *           description: Unique username
 *         password:
 *           type: string
 *           minLength: 6
 *           description: User's password (min 6 characters)
 *         avatar:
 *           type: string
 *           description: User's avatar URL
 *     AuthResponse:
 *       type: object
 *       properties:
 *         user:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             email:
 *               type: string
 *             username:
 *               type: string
 *             avatar:
 *               type: string
 *             createdAt:
 *               type: string
 *               format: date-time
 *         token:
 *           type: string
 *           description: JWT authentication token
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               msg:
 *                 type: string
 *               param:
 *                 type: string
 *               location:
 *                 type: string
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - password
 *               - avatar
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               username:
 *                 type: string
 *                 example: "johndoe"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "password123"
 *               avatar:
 *                 type: string
 *                 example: "https://example.com/avatar.jpg"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/register",
  [
    body("email").isEmail().notEmpty().withMessage("Add a valid mail"),
    body("password").notEmpty().withMessage("Add a password"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("at minimum 6 characters"),
    body("username").notEmpty().withMessage("add a valid username"),
    body("avatar").notEmpty().withMessage("add a avatar"),
    body("email").custom(async (value, { req }) => {
      const existingEmail = await User.findOne({ email: value });
      if (existingEmail) {
        throw new Error("The Email is Exists");
      }
      return true;
    }),
    body("username").custom(async (value, { req }) => {
      const existingEmail = await User.findOne({ username: value });
      if (existingEmail) {
        throw new Error("The username is Exists");
      }
      return true;
    }),
  ],
  register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid credentials or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/login",
  [
    body("email").isEmail().notEmpty().withMessage("Add a valid mail"),
    body("password").notEmpty().withMessage("Add a password"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("at minimum 6 characters"),
    body("email").custom(async (value, { req }) => {
      const existingEmail = await User.findOne({ email: value });
      if (!existingEmail) {
        throw new Error("The Email is not Exists");
      }
      return true;
    }),
  ],
  login
);

export default router;
