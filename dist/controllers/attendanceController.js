"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitAttendance = submitAttendance;
exports.getTodaysAttendance = getTodaysAttendance;
exports.getAttendanceSummary = getAttendanceSummary;
exports.getClassTodaysAttendance = getClassTodaysAttendance;
const client_1 = __importDefault(require("../prisma/client"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function submitAttendance(req, res) {
    try {
        const { attendanceData, classId } = req.body;
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!decoded?.teacher?.userId) {
            res.status(401).json({ error: "Invalid token structure" });
            return;
        }
        const teacher = await client_1.default.user.findUnique({
            where: { id: decoded.teacher.userId },
            include: { teacher: { select: { id: true } } },
        });
        if (!teacher?.teacher?.id) {
            res.status(404).json({ error: "Teacher not found" });
            return;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // First delete any existing attendance for today for these students
        await client_1.default.attendance.deleteMany({
            where: {
                teacherId: teacher.teacher.id,
                date: {
                    gte: new Date(today.setHours(0, 0, 0, 0)),
                    lt: new Date(today.setHours(23, 59, 59, 999)),
                },
                studentId: {
                    in: Object.keys(attendanceData),
                },
            },
        });
        const operations = [];
        for (const [studentId, status] of Object.entries(attendanceData)) {
            const scoreValue = status === "present" ? 1 : status === "late" ? 0.5 : 0;
            const activeIncrement = status === "present" ? 1 : 0;
            // Score handling
            operations.push(client_1.default.score.upsert({
                where: { studentId },
                update: {
                    attendance: { increment: scoreValue },
                    active: { increment: activeIncrement },
                },
                create: {
                    studentId,
                    attendance: scoreValue,
                    active: activeIncrement,
                    midterm: 0,
                    exam: 0,
                },
            }));
            // Attendance handling - now using upsert instead of create
            operations.push(client_1.default.attendance.upsert({
                where: {
                    studentId_teacherId_date: {
                        studentId,
                        teacherId: teacher.teacher.id,
                        date: today,
                    },
                },
                update: {
                    status: status,
                },
                create: {
                    studentId,
                    teacherId: teacher.teacher.id,
                    status: status,
                    date: today,
                    // semesterId: req.body.semesterId,
                },
            }));
        }
        await client_1.default.$transaction(operations);
        res.status(200).json({
            success: true,
            message: "Attendance submitted successfully",
        });
        return;
    }
    catch (error) {
        console.error("Error submitting attendance:", error);
        res.status(500).json({
            error: "Failed to submit attendance",
            message: error.message,
        });
        return;
    }
}
async function getTodaysAttendance(req, res) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!decoded?.teacher?.userId) {
            res.status(401).json({ error: "Invalid token structure" });
            return;
        }
        const teacher = await client_1.default.user.findUnique({
            where: { id: decoded.teacher.userId },
            select: { teacher: { select: { id: true } } },
        });
        if (!teacher?.teacher?.id) {
            res.status(404).json({ error: "Teacher not found" });
            return;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const attendances = await client_1.default.attendance.findMany({
            where: {
                teacherId: teacher.teacher?.id,
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
        res.status(500).json({
            error: "Failed to fetch attendance",
            err: error.message,
        });
    }
}
async function getAttendanceSummary(req, res) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!decoded?.teacher?.userId) {
            res.status(401).json({ error: "Invalid token structure" });
            return;
        }
        const teacher = await client_1.default.user.findUnique({
            where: { id: decoded.teacher.userId },
            select: { teacher: { select: { id: true } } },
        });
        if (!teacher?.teacher?.id) {
            res.status(404).json({ error: "Teacher not found" });
            return;
        }
        const students = await client_1.default.student.findMany({
            where: { teacherId: teacher.teacher.id },
            include: {
                scores: true,
                attendance: {
                    where: { teacherId: teacher.teacher.id },
                },
            },
        });
        const summary = students.map((student) => {
            const totalDays = student.attendance.length;
            const presentDays = student.attendance.filter((a) => a.status === "present").length;
            const lateDays = student.attendance.filter((a) => a.status === "late").length;
            const absentDays = student.attendance.filter((a) => a.status === "absent").length;
            const attendancePercentage = totalDays > 0
                ? Math.round(((presentDays + lateDays * 0.5) / totalDays) * 100)
                : 0;
            return {
                studentId: student.id,
                name: `${student.firstName} ${student.lastName}`,
                totalDays,
                presentDays,
                lateDays,
                absentDays,
                attendancePercentage,
                score: student.scores[0]?.attendance || 0,
                activeDays: student.scores[0]?.active || 0,
            };
        });
        res.status(200).json(summary);
    }
    catch (error) {
        console.log("Error fetching attendance summary:", error);
        res.status(500).json({
            error: "Failed to fetch attendance summary",
            err: error.message,
        });
    }
}
// Add this to your attendanceController.ts
async function getClassTodaysAttendance(req, res) {
    try {
        const { classId } = req.params;
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!decoded?.teacher?.userId) {
            res.status(401).json({ error: "Invalid token structure" });
            return;
        }
        const teacher = await client_1.default.user.findUnique({
            where: { id: decoded.teacher.userId },
            select: { teacher: { select: { id: true } } },
        });
        if (!teacher?.teacher?.id) {
            res.status(404).json({ error: "Teacher not found" });
            return;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Get students in the class
        const students = await client_1.default.student.findMany({
            where: { classId },
            select: { id: true },
        });
        const studentIds = students.map((student) => student.id);
        const attendances = await client_1.default.attendance.findMany({
            where: {
                teacherId: teacher.teacher.id,
                studentId: { in: studentIds },
                date: {
                    gte: today,
                    lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
                },
            },
            select: {
                studentId: true,
                status: true,
                student: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        const attendanceData = attendances.map((attendance) => ({
            studentId: attendance.studentId,
            status: attendance.status,
            name: `${attendance.student.firstName} ${attendance.student.lastName}`,
        }));
        res.status(200).json(attendanceData);
    }
    catch (error) {
        console.error("Error fetching class attendance:", error);
        res.status(500).json({
            error: "Failed to fetch class attendance",
            message: error.message,
        });
    }
}
//# sourceMappingURL=attendanceController.js.map