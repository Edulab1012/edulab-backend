import { PrismaClient } from "@prisma/client";
import { generatePromoCode } from "../utils/PromoCodeGenerator";
import { Request, Response } from "express";
import { X509Certificate } from "crypto";

const prisma = new PrismaClient();

export const createClass = async (req: Request, res: Response) => {
  try {
    const { name, userId, promoCode } = req.body;

    if (!name || !userId) {
      res
        .status(400)
        .json({ message: "Анги нэр болон хэрэглэгчийн ID шаардлагатай." });
      return;
    }

    // 🔍 Хэрэглэгчийн ID-аас багшийн ID-г олно
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { teacher: true },
    });

    if (!user || !user.teacher) {
      res.status(400).json({ message: "Багш олдсонгүй." });
      return;
    }

    const finalPromoCode = promoCode || generatePromoCode(name);

    const newClass = await prisma.class.create({
      data: {
        name,
        teacherId: user.teacher.id,
        promoCode: finalPromoCode,
      },

    });

    res.status(201).json(newClass);

    return;
  } catch (error: any) {
    console.error("❌ Error while creating class:", error);

    if (error.code === "P2002" && error.meta?.target?.includes("promoCode")) {
      res.status(409).json({ message: "Промо код давхцаж байна." });
      return;
    }

    res.status(500).json({ message: "Анги үүсгэхэд алдаа гарлаа." });
    return;
  }
};

//Check if class exists by promo code
export const checkClass = async (req: Request, res: Response) => {
  try {
    const { promoCode } = req.body;

    if (!promoCode) {
      res.status(400).json({ message: "код шаардлагатай." });
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
  } catch (error) {
    console.error("❌ Error while checking class:", error);
    res.status(500).json({ message: "Анги шалгахад алдаа гарлаа." });
  }
};
// Get all classes for a teacher
export const getTeacherClasses = async (req: Request, res: Response) => {
  try {
    const { teacherId } = req.params;
    console.log(teacherId);
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
  } catch (err) {
    console.error("❌ Error fetching teacher classes:", err);
    res.status(500).json({ error: "Failed to fetch teacher classes" });
  }
};

// Get all students in a specific class
export const getClassStudents = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;

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
      res.status(404).json({ error: "Class not found" });
      return;
    }

    res.status(200).json({
      className: classWithStudents.name,
      students: classWithStudents.students,
    });
  } catch (err) {
    console.error("❌ Error fetching class students:", err);
    res.status(500).json({ error: "Failed to fetch class students" });
  }
};

// Add this to your ClassController.ts
export const deleteClass = async (req: Request, res: Response) => {
  try {
    X509Certificate
    const { classId } = req.params;

    // First check if the class exists
    const existingClass = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!existingClass) {
      res.status(404).json({ message: "Анги олдсонгүй." });
      return;
    }


    // Then delete the class
    await prisma.class.delete({
      where: { id: classId },
    });

    res
      .status(200)
      .json({ success: true, message: "Анги амжилттай устгагдлаа." });
  } catch (error) {
    console.error("❌ Error while deleting class:", error);
    res.status(500).json({ message: "Анги устгахад алдаа гарлаа." });
  }
};
