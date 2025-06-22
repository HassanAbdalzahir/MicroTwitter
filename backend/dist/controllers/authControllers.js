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
exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const express_validator_1 = require("express-validator");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const error = (0, express_validator_1.validationResult)(req);
    try {
        const { email, password, username, avatar } = req.body;
        if (!error.isEmpty()) {
            res.status(400).json({ errors: error.array() });
            return;
        }
        const hashed = yield bcryptjs_1.default.hash(password, 10);
        const user = yield User_1.default.create({
            email,
            avatar,
            username,
            password: hashed,
        });
        const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email, username: user.username }, JWT_SECRET, { expiresIn: "3d" });
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
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: "Registration failed" });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const error = (0, express_validator_1.validationResult)(req);
    try {
        if (!error.isEmpty()) {
            res.status(400).json({ errors: error.array() });
            return;
        }
        const { email, password } = req.body;
        const user = yield User_1.default.findOne({ email });
        const valid = yield bcryptjs_1.default.compare(password, user.password);
        if (!valid) {
            res.status(400).json({ error: "password is wrong" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email, username: user.username }, JWT_SECRET, { expiresIn: "3d" });
        res.json({
            user: { _id: user === null || user === void 0 ? void 0 : user._id, email: user === null || user === void 0 ? void 0 : user.email, createdAt: user === null || user === void 0 ? void 0 : user.createdAt },
            token,
        });
    }
    catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
});
exports.login = login;
