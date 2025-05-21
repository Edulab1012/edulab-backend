"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTeachingClass = exports.getClassesByTeacher = exports.addTeachingClass = void 0;
const client_1 = __importDefault(require("../prisma/client"));
// POST: Create new class
const addTeachingClass = async (req, res) => {
    try {
        const { subject, grade, schedule, term } = req.body;
        const teacherId = req.user?.id || req.body.teacherId;
        if (!teacherId) {
            res.status(400).json({ error: "Teacher ID is required" });
            return;
        }
        const newClass = await client_1.default.teachingClass.create({
            data: { subject, grade, schedule, term, teacherId },
        });
        res.status(201).json({ message: "✅ Class created", teachingClass: newClass });
    }
    catch (error) {
        console.error("❌ Failed to create class:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
};
exports.addTeachingClass = addTeachingClass;
// GET: All classes by teacher
const getClassesByTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const classes = await client_1.default.teachingClass.findMany({
            where: { teacherId },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json(classes);
    }
    catch (error) {
        console.error("❌ Failed to get classes:", error);
        res.status(500).json({ error: "Failed to load classes" });
    }
};
exports.getClassesByTeacher = getClassesByTeacher;
// DELETE: Remove a class
const deleteTeachingClass = async (req, res) => {
    try {
        const { id } = req.params;
        await client_1.default.teachingClass.delete({ where: { id } });
        res.status(200).json({ message: "✅ Class deleted" });
    }
    catch (error) {
        console.error("❌ Failed to delete class:", error);
        res.status(500).json({ error: "Failed to delete class" });
    }
};
exports.deleteTeachingClass = deleteTeachingClass;
//# sourceMappingURL=teachingClassController.js.map