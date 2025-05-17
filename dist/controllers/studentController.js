"use strict";
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
exports.getTeacherWithStudents = exports.addStudent = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const addStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { teacherId, firstName, lastName, email, phoneNumber, emergencyNumber, } = req.body;
    try {
        const teacher = yield client_1.default.teacher.findUnique({
            where: { id: "52aca953-dd89-4650-90e0-ddda6711ef9b" },
        });
        if (!teacher || !teacher.groupId) {
            res
                .status(400)
                .json({ error: "Teacher not found or not assigned to any grade" });
            return;
        }
        const existingStudent = yield client_1.default.student.findUnique({
            where: { email },
        });
        if (existingStudent) {
            res.status(409).json({ error: "Student with this email already exists" });
            return;
        }
        const student = yield client_1.default.student.upsert({
            where: { email },
            update: {
                firstName,
                lastName,
                phoneNumber,
                emergencyNumber,
                teacherId: teacher.id,
                groupId: teacher.groupId,
            },
            create: {
                firstName,
                lastName,
                email,
                phoneNumber,
                emergencyNumber,
                teacherId: teacher.id,
                groupId: teacher.groupId,
            },
        });
        res.status(201).json({ message: "✅ Student created", student });
    }
    catch (error) {
        console.error("❌ Failed to add student:", error);
        res.status(500).json({ error: "Failed to add student" });
    }
});
exports.addStudent = addStudent;
const getTeacherWithStudents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { teacherId } = req.params;
    try {
        const teacher = yield client_1.default.teacher.findUnique({
            where: { id: teacherId },
        });
        if (!teacher || !teacher.groupId) {
            res
                .status(404)
                .json({ error: "Teacher not found or not assigned to group" });
            return;
        }
        const students = yield client_1.default.student.findMany({
            where: {
                groupId: teacher.groupId,
            },
        });
        res.status(200).json({ teacher, students });
    }
    catch (error) {
        console.error("❌ Failed to fetch teacher and students:", error);
        res.status(500).json({ error: "Failed to fetch teacher's students" });
    }
});
exports.getTeacherWithStudents = getTeacherWithStudents;
