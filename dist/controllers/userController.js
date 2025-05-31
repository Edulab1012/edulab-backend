"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.checkUser = exports.createUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
//Create User ➕
const prisma = new client_1.PrismaClient();
const createUser = async (req, res) => {
    try {
        const { username, email, password, role, classId, phoneNumber } = req.body;
        const existingUser = await prisma.user.findFirst({
            where: { email },
        });
        if (existingUser) {
            res.status(403).json({ message: "❌ Хэрэглэгч аль хэдийн бүртгэгдсэн байна." });
            return;
        }
        const existingUsername = await prisma.user.findUnique({
            where: { username },
        });
        if (existingUsername) {
            res.status(409).json({ message: "❗ Энэ хэрэглэгчийн нэр аль хэдийн байна." });
            return;
        }
        if (role === "student") {
            const existingStudent = await prisma.student.findUnique({
                where: { email },
            });
            if (existingStudent) {
                res.status(409).json({
                    message: "❗ Энэ имэйлээр сурагч бүртгэгдсэн байна.",
                });
                return;
            }
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            // Эхлээд хэрэглэгчийг үүсгэнэ
            const newUser = await prisma.user.create({
                data: {
                    username,
                    email,
                    password: hashedPassword,
                    role,
                },
            });
            // Ролиос хамаарч холбоотой model-уудыг үүсгэнэ
            if (role === "teacher") {
                const teacher = await prisma.teacher.create({
                    data: {
                        user: { connect: { id: newUser.id } },
                        email: newUser.email,
                        firstName: "",
                        lastName: "",
                        subject: [],
                        phoneNumber: phoneNumber,
                    },
                });
                // User-ийг шинэчилж teacherId-г хадгална
                await prisma.user.update({
                    where: { id: newUser.id },
                    data: { teacherId: teacher.id },
                });
            }
            if (role === "student") {
                const student = await prisma.student.create({
                    data: {
                        user: { connect: { id: newUser.id } },
                        email: newUser.email,
                        firstName: "",
                        lastName: "",
                        class: classId ? { connect: { id: classId } } : undefined,
                    },
                });
                // User-ийг шинэчилж studentId-г хадгална
                await prisma.user.update({
                    where: { id: newUser.id },
                    data: { studentId: student.id },
                });
            }
            // Амжилттай хариу буцаах
            res.status(201).json({ success: true, user: newUser });
            return;
        }
    }
    catch (err) {
        console.error("❌ Error creating user:", err);
        res.status(500).json({ error: "Хэрэглэгч үүсгэхэд алдаа гарлаа." });
        return;
    }
};
exports.createUser = createUser;
// 📌 CHECK User (LOGIN)
const checkUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findFirst({
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
        const users = await prisma.user.findMany();
        res.status(200).json(users);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
};
exports.getAllUsers = getAllUsers;
//# sourceMappingURL=userController.js.map