"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTeacher = addTeacher;
exports.getStudentsWithAttendance = getStudentsWithAttendance;
exports.submitAttendance = submitAttendance;
exports.getTodaysAttendance = getTodaysAttendance;
const client_1 = __importDefault(require("../prisma/client"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// ✅ Add Teacher
async function addTeacher(req, res) {
    const { firstName, lastName, email, phoneNumber, subject } = req.body;
    try {
        const teacher = await client_1.default.teacher.create({
            data: {
                firstName,
                lastName,
                email,
                phoneNumber,
                subject,
                user: {
                    create: {
                        email,
                        password: "teacher1234",
                        role: "teacher",
                    },
                },
            },
        });
        res.status(201).json({
            success: true,
            message: "✅ Teacher added successfully",
            data: teacher,
        });
    }
    catch (error) {
        console.log("Add teacher error:", error);
        res.status(500).json({ error: "Failed to add teacher", err: error.message });
    }
}
// ✅ Get Students for This Teacher
async function getStudentsWithAttendance(req, res) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token)
            return res.status(401).json({ error: "Unauthorized" });
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const teacher = await client_1.default.user.findUnique({
            where: { id: decoded.userId },
            select: { teacherId: true },
        });
        if (!teacher?.teacherId)
            return res.status(404).json({ error: "Teacher not found" });
        const students = await client_1.default.student.findMany({
            where: { teacherId: teacher.teacherId },
            include: {
                teacher: {
                    select: { firstName: true, lastName: true },
                },
            },
        });
        res.status(200).json(students);
    }
    catch (error) {
        console.log("Error fetching students:", error);
        res.status(500).json({ error: "Failed to fetch students", err: error.message });
    }
}
// ✅ Submit Attendance
async function submitAttendance(req, res) {
    try {
        const { attendanceData } = req.body;
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const teacher = await client_1.default.user.findUnique({
            where: { id: decoded.userId },
            select: { teacherId: true },
        });
        if (!teacher?.teacherId) {
            res.status(404).json({ error: "Teacher not found" });
            return;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const createdAttendances = await client_1.default.$transaction(Object.entries(attendanceData).map(([studentId, status]) => client_1.default.attendance.upsert({
            where: {
                studentId_teacherId_date: {
                    studentId,
                    teacherId: teacher.teacherId,
                    date: today,
                },
            },
            update: { status: status },
            create: {
                studentId,
                teacherId: teacher.teacherId,
                status: status,
                date: today,
            },
        })));
        res.status(200).json({
            success: true,
            message: "Attendance submitted successfully",
            data: createdAttendances,
        });
    }
    catch (error) {
        console.log("Error submitting attendance:", error);
        res.status(500).json({ error: "Failed to submit attendance", err: error.message });
    }
}
// ✅ Get Today's Attendance
async function getTodaysAttendance(req, res) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token)
            return res.status(401).json({ error: "Unauthorized" });
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const teacher = await client_1.default.user.findUnique({
            where: { id: decoded.userId },
            select: { teacherId: true },
        });
        if (!teacher?.teacherId)
            return res.status(404).json({ error: "Teacher not found" });
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const attendances = await client_1.default.attendance.findMany({
            where: {
                teacherId: teacher.teacherId,
                date: {
                    gte: today,
                    lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
                },
            },
            select: {
                studentId: true,
                status: true,
            },
        });
        const attendanceMap = attendances.reduce((acc, curr) => {
            acc[curr.studentId] = curr.status;
            return acc;
        }, {});
        res.status(200).json(attendanceMap);
    }
    catch (error) {
        console.log("Error fetching today's attendance:", error);
        res.status(500).json({ error: "Failed to fetch attendance", err: error.message });
    }
}
//# sourceMappingURL=teacherController.js.map