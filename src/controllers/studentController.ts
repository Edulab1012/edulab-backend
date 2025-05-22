import { Request, Response } from "express";
import prisma from "../prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export const addStudent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      res.status(401).json({
        error:
          "❗ Token is missing. Please login and include the Authorization header like: Bearer <token>",
      });
      return;
    }
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const token = authHeader.split(" ")[1];

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as {
      userId: string;
      role: string;
      id: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decodedToken.userId },
    });

    if (!user || (user.role !== "teacher" && user.role !== "admin")) {
      res.status(403).json({
        error: "⛔ You are not authorized to add students",
        message: "⛔ Зөвхөн багш эсвэл админ л сурагч нэмэх боломжтой.",
      });
      return;
    }

    const teacherId = decodedToken.id;

    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });
    // 2. finding Teacher by teacherId for groupId
    const groupId = teacher?.groupId; //💎 Group
    const gradeId = teacher?.gradeId; //💎 Grade (use in 👇🏻 add new student)
    // 3. taking groupId from teacher table

    // ✅ 5. Extract student data

    const { firstName, lastName, email, phoneNumber, emergencyNumber, gender } =
      req.body;
    console.log(req.body.gender);

    if (!gender || !["male", "female"].includes(gender)) {
      res.status(400).json({ error: "Invalid gender value" });
      return;
    }
    if (!teacher || !teacher.groupId || !teacher.gradeId) {
      res.status(400).json({
        error: "❗ Teacher is not assigned to a group, ",
        message:
          "❗ Зөвхөн ангийн багш л сурагч нэмэх боломжтой. Та бүлэг болон ангид хамааралгүй байна.",
      });
      return;
    }

    const newStudent = await prisma.student.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        emergencyNumber,
        gender,
        teacherId: teacher.id,
        groupId: teacher.groupId,
        gradeId: teacher.gradeId,
        user: {
          create: {
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
    return;
  } catch (error: any) {
    console.log("❌ Error adding student:", error);
    if (error.name === "TokenExpiredError") {
      res
        .status(401)
        .json({ error: "⏰ Token has expired. Please login again." });
    } else if (error.name === "JsonWebTokenError") {
      res.status(401).json({ error: "❗ Invalid token. Please login again." });
    } else {
      res.status(500).json({ error: "Failed to add student" });
    }
  }
};

export const getStudentsByTeacher = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      res.status(401).json({
        error:
          "❗ Token is missing. Please login and include the Authorization header",
      });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as {
      userId: string;
      role: string;
      id: string; // This should be the teacher's ID
    };

    // Verify the user is a teacher
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.userId },
    });

    if (!user || user.role !== "teacher") {
      res.status(403).json({
        error: "⛔ You are not authorized to view these students",
      });
      return;
    }

    // Find the teacher's students
    const students = await prisma.student.findMany({
      where: {
        teacherId: decodedToken.id, // Using the teacher's ID from token
      },
      include: {
        group: true,
        grade: true,
        teacher: true,
      },
    });

    res.status(200).json(students);
  } catch (error: any) {
    console.log("❌ Error fetching students:", error);
    if (error.name === "TokenExpiredError") {
      res
        .status(401)
        .json({ error: "⏰ Token has expired. Please login again." });
    } else if (error.name === "JsonWebTokenError") {
      res.status(401).json({ error: "❗ Invalid token. Please login again." });
    } else {
      res.status(500).json({ error: "Failed to fetch students" });
    }
  }
};
// 📌Get All Student
export const getAllStudents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const students = await prisma.student.findMany({
      include: {
        group: true,
        grade: true,
        teacher: true,
      },
    });

    console.log("📦 All students fetched:", students.length);

    res.status(200).json({ students });
  } catch (error: any) {
    console.log("❌ Failed to fetch students:", error.message);
    res
      .status(500)
      .json({ error: "Сурагчдын мэдээллийг авахад алдаа гарлаа." });
  }
};
