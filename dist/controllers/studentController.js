"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStudentAvatar = exports.getStudent = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                class: true,
                teacher: true,
                user: {
                    select: {
                        username: true,
                        email: true,
                    },
                },
            },
        });
        if (!student) {
            res.status(404).json({ message: "Student not found" });
            return;
        }
        res.status(200).json(student);
    }
    catch (error) {
        console.error("Error fetching student:", error);
        res.status(500).json({ message: "Failed to fetch student" });
    }
};
exports.getStudent = getStudent;
//student Avatar profile image uplaod 
const updateStudentAvatar = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { avatarUrl } = req.body;
        if (!avatarUrl) {
            return res.status(400).json({ message: "avatarUrl is required" });
        }
        const updatedStudent = await prisma.student.update({
            where: { id: studentId },
            data: { avatarUrl },
        });
        res.status(200).json({ message: "Avatar updated", student: updatedStudent });
    }
    catch (error) {
        console.error("Error updating student avatar:", error);
        res.status(500).json({ message: "Failed to update avatar" });
    }
};
exports.updateStudentAvatar = updateStudentAvatar;
//# sourceMappingURL=studentController.js.map