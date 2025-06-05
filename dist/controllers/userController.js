"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuth = exports.getAllUsers = exports.checkUser = exports.createUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = __importDefault(require("../prisma/client"));
//Create User ➕
const createUser = async (req, res) => {
    try {
        const { username, email, password, role, classId } = req.body;
        const existingUser = await client_1.default.user.findFirst({
            where: { email },
        });
        if (existingUser) {
            res
                .status(403)
                .json({ message: " Имэйл бүртгэгдсэн байна. Нэвтэрнэ үү." });
            return;
        }
        const existingUsername = await client_1.default.user.findUnique({
            where: { username },
        });
        if (existingUsername) {
            res
                .status(409)
                .json({ message: " Нэр давхцаж байна. Өөр нэр сонгоно уу." });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Create user first
        const newUser = await client_1.default.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role,
                classId
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
            //✅
            const token = createToken({ teacher });
            res.status(201).json({ success: true, user: newUser, teacher: { id: teacher?.id }, token });
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
            //✅
            const token = createToken({ student });
            res.status(201).json({ success: true, user: newUser, student: { id: student?.id }, token });
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
            const teacher = await client_1.default.teacher.findFirst({ where: { email } });
            const token = createToken({ teacher });
            res.status(200).json({
                message: "✅ Teacher authenticated successfully",
                success: true,
                user: {
                    id: user.id,
                    role: user.role
                },
                teacher: { id: teacher?.id },
                token
            });
        }
        if (user.role === "student") {
            const student = await client_1.default.student.findFirst({ where: { email } });
            const token = createToken({ student });
            res.status(200).json({
                message: "✅ Student authenticated successfully",
                success: true,
                user: {
                    id: user.id,
                    role: user.role
                },
                student: { id: student?.id },
                token
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
// TOKEN uusgegch function 
const createToken = (payload) => {
    if (!process.env.JWT_SECRET)
        throw new Error("JWT_SECRET is not defined");
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
};
//Google register
const googleAuth = async (req, res) => {
    try {
        const { id, email, fullName, avatarUrl, role, classId } = req.body;
        if (!role) {
            res.status(400).json({ success: false, message: "ROLE is missing" });
            return;
        }
        try {
            const existingUser = await client_1.default.user.findFirst({ where: { email }, include: { teacher: true, student: true } });
            const token = createToken({ existingUser });
            if (existingUser && existingUser.role == "teacher") {
                res.status(200).json({ success: true, user: existingUser, teacher: { id: existingUser.teacher?.id }, token });
                return;
            }
            if (existingUser && existingUser.role == "student") {
                res.status(200).json({ success: true, user: existingUser, student: { id: existingUser.student?.id }, token });
                return;
            }
        }
        catch (err) {
            res.status(401).json({ success: false, message: "Existing user" });
        }
        const defaultPassword = await bcrypt_1.default.hash("password", 10);
        const newUser = await client_1.default.user.create({
            data: {
                id,
                email,
                username: fullName ?? email,
                role,
                password: defaultPassword,
                classId
            }
        });
        // 🌱 Create role-based Teacher
        if (role === "teacher") {
            const teacher = await client_1.default.teacher.create({
                data: {
                    userId: newUser.id,
                    email,
                    firstName: fullName ?? "",
                    lastName: "",
                    avatarUrl,
                    subject: [],
                    password: defaultPassword,
                },
            });
            const token = createToken({ teacher });
            res.status(201).json({
                success: true,
                user: newUser,
                teacher: { id: teacher.id },
                token,
            });
            return;
        }
        if (role === "student") {
            const student = await client_1.default.student.create({
                data: {
                    user: { connect: { id: newUser.id } },
                    email,
                    firstName: fullName ?? "",
                    lastName: "",
                    avatarUrl,
                    class: classId ? { connect: { id: classId } } : undefined,
                },
            });
            const token = createToken({ student });
            res.status(201).json({
                success: true,
                user: newUser,
                student: { id: student.id },
                token,
            });
            return;
        }
        res.status(400).json({ message: "Роль буруу байна." });
    }
    catch (err) {
        console.error("❌ Google Auth Error:", err);
        res.status(500).json({ error: "Google-р бүртгэхэд алдаа гарлаа." });
    }
};
exports.googleAuth = googleAuth;
//# sourceMappingURL=userController.js.map