"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.checkUser = exports.createUser = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const bcrypt_1 = __importDefault(require("bcrypt"));
//Create User ➕
const createUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        const existingUser = await client_1.default.user.findFirst({
            where: { email },
        });
        if (existingUser) {
            res.status(403).json({ error: "❌ User already exists" });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10); // 10 rounds of salt
        const user = await client_1.default.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role,
            },
        });
        res.status(201).json(user);
        return;
    }
    catch (err) {
        res.status(500).json({ error: "Failed to create user" });
    }
};
exports.createUser = createUser;
// 📌 CHECK User (LOGIN)
const checkUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await client_1.default.user.findFirst({
            where: { email },
        });
        if (!user) {
            res.status(401).json({ error: "❌ Invalid credentials" });
            return;
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: "❌ Invalid credentials" });
            return;
        }
        if (user.role === "teacher") {
            res.status(200).json({
                message: "✅ Teacher authenticated successfully",
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                }
            });
        }
        if (user.role === "student") {
            res.status(200).json({
                message: "✅ Student authenticated successfully",
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                }
            });
        }
    }
    catch (err) {
        console.log("❌ Login error:", err);
        res.status(500).json({ message: "❌ Failed to check user", error: err });
    }
};
exports.checkUser = checkUser;
// 📌 GET ALL Users
const getAllUsers = async (req, res) => {
    try {
        const users = await client_1.default.user.findMany();
        res.status(200).json(users);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
};
exports.getAllUsers = getAllUsers;
//# sourceMappingURL=userController.js.map