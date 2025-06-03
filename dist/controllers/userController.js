"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.checkUser = exports.createUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = __importDefault(require("../prisma/client"));
//Create User ➕
const createUser = async (req, res) => {
    try {
        const { username, email, password, role, classId } = req.body;
        // const existingUser = await prisma.user.findFirst({
        //   where: { email },
        // });
        // if (existingUser) {
        //   res
        //     .status(403)
        //     .json({ message: "❌ Хэрэглэгч аль хэдийн бүртгэгдсэн байна." });
        //   return;
        // }
        // const existingUsername = await prisma.user.findUnique({
        //   where: { username },
        // });
        // if (existingUsername) {
        //   res
        //     .status(409)
        //     .json({ message: "❗ Энэ хэрэглэгчийн нэр аль хэдийн байна." });
        //   return;
        // }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Create user first
        const newUser = await client_1.default.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role,
            },
        });
        // Depending on role, create related models
        if (role === "teacher") {
            const teacher = await client_1.default.teacher.create({
                data: {
                    userId: newUser.id,
                    email: newUser.email,
                    firstName: "",
                    lastName: "",
                    subject: [],
                    password: hashedPassword,
                },
            });
            res.status(201).json({
                success: true,
                user: newUser,
                teacher,
            });
            return;
        }
        if (role === "student") {
            const student = await client_1.default.student.create({
                data: {
                    user: { connect: { id: newUser.id } },
                    email: newUser.email,
                    firstName: "",
                    lastName: "",
                    class: classId ? { connect: { id: classId } } : undefined,
                },
            });
            res.status(201).json({ success: true, user: newUser, student });
        }
        return;
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
        const user = await client_1.default.user.findFirst({
            where: { email },
            include: {
                teacher: true,
                student: true,
            },
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
                    teacherId: user.teacher ? user.teacher.id : null,
                },
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
                    studentId: user.student ? user.student.id : null,
                },
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