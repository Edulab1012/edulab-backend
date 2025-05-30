"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllStudents = exports.getStudentsByTeacher = exports.addStudent = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// ✅ Add Student
const addStudent = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer")) {
            res.status(401).json({
                error: "❗ Token is missing. Please login and include the Authorization header like: Bearer <token>",
            });
            return;
        }
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await client_1.default.user.findUnique({ where: { id: decoded.userId } });
        const teacher = await client_1.default.teacher.findUnique({ where: { id: decoded.id } });
        if (!teacher) {
            res.status(400).json({
                error: "❗ Teacher not found",
                message: "❗ Багшийн мэдээлэл олдсонгүй.",
            });
            return;
        }
        const { firstName, lastName, email, phoneNumber, emergencyNumber, gender } = req.body;
        if (!gender || !["male", "female"].includes(gender)) {
            res.status(400).json({ error: "Invalid gender value" });
            return;
        }
        const newStudent = await client_1.default.student.create({
            data: {
                firstName,
                lastName,
                email,
                phoneNumber,
                emergencyNumber,
                gender,
                teacherId: teacher.id,
                user: {
                    create: {
                        username: email,
                        email,
                        password: "student1234",
                        role: "student",
                    },
                },
            },
            include: {
                user: true,
            },
        });
        res.status(201).json({
            message: `✅ New Student ${firstName} ${lastName} created`,
            student: newStudent,
        });
    }
    catch (error) {
        console.log("❌ Error adding student:", error);
        if (error.name === "TokenExpiredError") {
            res.status(401).json({ error: "⏰ Token has expired. Please login again." });
        }
        else if (error.name === "JsonWebTokenError") {
            res.status(401).json({ error: "❗ Invalid token. Please login again." });
        }
        else {
            res.status(500).json({ error: "Failed to add student" });
        }
    }
};
exports.addStudent = addStudent;
// ✅ Get Students by Teacher
const getStudentsByTeacher = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer")) {
            res.status(401).json({ error: "❗ Token is missing. Please login and include the Authorization header" });
            return;
        }
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await client_1.default.user.findUnique({ where: { id: decoded.userId } });
        if (!user || user.role !== "teacher") {
            res.status(403).json({ error: "⛔ You are not authorized to view these students" });
            return;
        }
        const students = await client_1.default.student.findMany({
            where: { teacherId: decoded.id },
            include: {
                teacher: true,
            },
        });
        res.status(200).json(students);
    }
    catch (error) {
        console.log("❌ Error fetching students:", error);
        if (error.name === "TokenExpiredError") {
            res.status(401).json({ error: "⏰ Token has expired. Please login again." });
        }
        else if (error.name === "JsonWebTokenError") {
            res.status(401).json({ error: "❗ Invalid token. Please login again." });
        }
        else {
            res.status(500).json({ error: "Failed to fetch students" });
        }
    }
};
exports.getStudentsByTeacher = getStudentsByTeacher;
// ✅ Get All Students
const getAllStudents = async (req, res) => {
    try {
        const students = await client_1.default.student.findMany({
            include: {
                teacher: true,
            },
        });
        console.log("📦 All students fetched:", students.length);
        res.status(200).json({ students });
    }
    catch (error) {
        console.log("❌ Failed to fetch students:", error.message);
        res.status(500).json({ error: "Сурагчдын мэдээллийг авахад алдаа гарлаа." });
    }
};
exports.getAllStudents = getAllStudents;
//# sourceMappingURL=studentController.js.map