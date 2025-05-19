"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.checkUser = exports.createUser = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const createUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const user = await client_1.default.user.create({
            data: { email, password, role },
        });
        res.status(201).json(user);
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
            where: { email, password },
        });
        if (user && user.role === "teacher") {
            res.status(200).json({ message: "teacher" });
        }
        else if (user && user.role === "student") {
            res.status(200).json({ message: "student" });
        }
        else if (user && user.role === "parent") {
            res.status(200).json({ message: "parent" });
        }
        else if (user && user.role === "admin") {
            res.status(200).json({ message: "admin" });
        }
        else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    }
    catch (err) {
        res.status(500).json({ error: "Failed to check user" });
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