"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.createPost = exports.getPosts = void 0;
const Post_1 = __importDefault(require("../models/Post"));
const getPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get all posts and populate user
        const posts = yield Post_1.default.find().sort({ createdAt: -1 }).populate("user");
        // Map to include avatar and username
        const postsWithAvatars = posts.map((post) => {
            var _a, _b;
            return ({
                _id: post._id,
                name: ((_a = post.user) === null || _a === void 0 ? void 0 : _a.username) || post.name,
                content: post.content,
                avatar: ((_b = post.user) === null || _b === void 0 ? void 0 : _b.avatar) || post.avatar || "",
                createdAt: post.createdAt,
            });
        });
        res.json(postsWithAvatars);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch posts" });
    }
});
exports.getPosts = getPosts;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const User = (yield Promise.resolve().then(() => __importStar(require("../models/User")))).default;
        const userDoc = yield User.findOne({ email: req.user.email });
        if (!userDoc) {
            res.status(400).json({ error: "User not found" });
            return;
        }
        const post = yield Post_1.default.create({
            name: userDoc.username,
            content,
            avatar: userDoc.avatar,
            user: userDoc._id,
        });
        res.status(201).json(post);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to create post" });
    }
});
exports.createPost = createPost;
