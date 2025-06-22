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
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
const authControllers_1 = require("../controllers/authControllers");
const router = (0, express_1.Router)();
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
router.post("/register", [
    (0, express_validator_1.body)("email").isEmail().notEmpty().withMessage("Add a valid mail"),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Add a password"),
    (0, express_validator_1.body)("password")
        .isLength({ min: 6 })
        .withMessage("at minimum 6 characters"),
    (0, express_validator_1.body)("username").notEmpty().withMessage("add a valid username"),
    (0, express_validator_1.body)("avatar").notEmpty().withMessage("add a avatar"),
    (0, express_validator_1.body)("email").custom((value_1, _a) => __awaiter(void 0, [value_1, _a], void 0, function* (value, { req }) {
        const existingEmail = yield User_1.default.findOne({ email: value });
        if (existingEmail) {
            throw new Error("The Email is Exists");
        }
        return true;
    })),
    (0, express_validator_1.body)("username").custom((value_1, _a) => __awaiter(void 0, [value_1, _a], void 0, function* (value, { req }) {
        const existingEmail = yield User_1.default.findOne({ username: value });
        if (existingEmail) {
            throw new Error("The username is Exists");
        }
        return true;
    })),
], authControllers_1.register);
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
router.post("/login", [
    (0, express_validator_1.body)("email").isEmail().notEmpty().withMessage("Add a valid mail"),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Add a password"),
    (0, express_validator_1.body)("password")
        .isLength({ min: 6 })
        .withMessage("at minimum 6 characters"),
    (0, express_validator_1.body)("email").custom((value_1, _a) => __awaiter(void 0, [value_1, _a], void 0, function* (value, { req }) {
        const existingEmail = yield User_1.default.findOne({ email: value });
        if (!existingEmail) {
            throw new Error("The Email is not Exists");
        }
        return true;
    })),
], authControllers_1.login);
exports.default = router;
