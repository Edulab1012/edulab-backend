"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClass = exports.getClassStudents = exports.getTeacherClasses = exports.checkClass = exports.createClass = void 0;
const client_1 = require("@prisma/client");
const PromoCodeGenerator_1 = require("../utils/PromoCodeGenerator");
const prisma = new client_1.PrismaClient();
const createClass = async (req, res) => {
    try {
        const { name, userId, promoCode } = req.body;
        if (!name || !userId) {
            res
                .status(400)
                .json({ message: "Анги нэр болон хэрэглэгчийн ID шаардлагатай." });
            return;
        }
        // Хэрэглэгчийн ID-аас багшийн ID-г олно
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { teacher: true },
        });
        if (!user || !user.teacher) {
            res.status(400).json({ message: "Багш олдсонгүй." });
            return;
        }
        // Хэрэв хэрэглэгчээс promoCode ирээгүй бол автомат бус код үүсгэнэ
        const finalPromoCode = promoCode || (0, PromoCodeGenerator_1.generatePromoCode)(name);
        const newClass = await prisma.class.create({
            data: {
                name,
                teacherId: user.teacher.id,
                promoCode: finalPromoCode,
            },
        });
        res.status(201).json(newClass);
    }
    catch (error) {
        console.error("❌ Error while creating class:", error);
        if (error.code === "P2002" && error.meta?.target?.includes("promoCode")) {
            res.status(409).json({ message: "Промо код давхцаж байна." });
            return;
        }
        res.status(500).json({ message: "Анги үүсгэхэд алдаа гарлаа." });
    }
};
exports.createClass = createClass;
// Check if class exists by promo code
const checkClass = async (req, res) => {
    try {
        const { promoCode } = req.body;
        if (!promoCode) {
            res.status(400).json({ message: "Код шаардлагатай." });
            return;
        }
        const existingClass = await prisma.class.findUnique({
            where: { promoCode },
        });
        if (!existingClass) {
            res.status(404).json({ message: "Анги олдсонгүй." });
            return;
        }
        res.status(200).json({ success: true, class: existingClass });
    }
    catch (error) {
        console.error("❌ Error while checking class:", error);
        res.status(500).json({ message: "Анги шалгахад алдаа гарлаа." });
    }
};
exports.checkClass = checkClass;
// Get all classes for a teacher
const getTeacherClasses = async (req, res) => {
    try {
        const { teacherId } = req.params;
        console.log("Teacher ID:", teacherId);
        const classes = await prisma.class.findMany({
            where: { teacherId },
            select: {
                id: true,
                name: true,
                createdAt: true,
                promoCode: true,
            },
        });
        res.status(200).json(classes);
    }
    catch (err) {
        console.error("❌ Error fetching teacher classes:", err);
        res.status(500).json({ error: "Failed to fetch teacher classes" });
    }
};
exports.getTeacherClasses = getTeacherClasses;
// Get all students in a specific class
const getClassStudents = async (req, res) => {
    try {
        const { classId } = req.params;
        console.log("Fetching students for class ID:", classId);
        const classWithStudents = await prisma.class.findUnique({
            where: { id: classId },
            include: {
                students: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phoneNumber: true,
                    },
                },
            },
        });
        if (!classWithStudents) {
            res.status(404).json({ error: "Анги олдсонгүй." });
            return;
        }
        res.status(200).json({
            className: classWithStudents.name,
            students: classWithStudents.students,
        });
    }
    catch (err) {
        console.error("❌ Error fetching class students:", err);
        res.status(500).json({ error: "Failed to fetch class students" });
    }
};
exports.getClassStudents = getClassStudents;
// Delete a specific class
const deleteClass = async (req, res) => {
    try {
        const { classId } = req.params;
        // Өмнө нь анги байгаа эсэхийг шалга
        const existingClass = await prisma.class.findUnique({
            where: { id: classId },
        });
        if (!existingClass) {
            res.status(404).json({ message: "Анги олдсонгүй." });
            return;
        }
        // Дараа нь ангийг устга
        await prisma.class.delete({
            where: { id: classId },
        });
        res
            .status(200)
            .json({ success: true, message: "Анги амжилттай устгагдлаа." });
    }
    catch (error) {
        console.error("❌ Error while deleting class:", error);
        res.status(500).json({ message: "Анги устгахад алдаа гарлаа." });
    }
};
exports.deleteClass = deleteClass;
//# sourceMappingURL=ClassController.js.map