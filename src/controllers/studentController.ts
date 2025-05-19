import { Request, Response } from "express";
import prisma from "../prisma/client";
import jwt from "jsonwebtoken";
interface JwtPayload {
  id: string;
  role: string;
  teacherId?: string;
  groupId?: string;
  gradeId?: string;
}
const JWT_SECRET = "my_super_secret_key_123456";
export const addStudent = async (req: Request, res: Response) => {
  const { firstName, lastName, email, phoneNumber, emergencyNumber } = req.body;

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET!) as JwtPayload;

    if (
      decoded.role !== "teacher" ||
      !decoded.teacherId ||
      !decoded.groupId ||
      !decoded.gradeId
    ) {
      res
        .status(403)
        .json({ error: "Unauthorized: Invalid teacher credentials" });
      return;
    }

    if (email) {
      const existingStudent = await prisma.student.findUnique({
        where: { email },
      });
      if (existingStudent) {
        res
          .status(409)
          .json({ error: "Student with this email already exists" });
        return;
      }
    }

    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        emergencyNumber,
        teacherId: decoded.teacherId,
        groupId: decoded.groupId,
        gradeId: decoded.gradeId,
      },
    });

    if (email) {
      await prisma.user.create({
        data: {
          email,
          password: "student1234",
          role: "student",
        },
      });
    }

    res.status(201).json({ message: "✅ Student created", student });
  } catch (error) {
    console.error("❌ Failed to add student:", error);
    res.status(500).json({ error: "Failed to add student" });
  }
};
export const getTeacherWithStudents = async (req: Request, res: Response) => {
  const { teacherId } = req.params;
  console.log(teacherId);
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });
    console.log(teacher);
    if (!teacher || !teacher.groupId) {
      res
        .status(404)
        .json({ error: "Teacher not found or not assigned to group" });
      return;
    }

    const students = await prisma.student.findMany({
      where: {
        groupId: teacher.groupId,
      },
    });

    res.status(200).json({ teacher, students });
  } catch (error) {
    console.error("❌ Failed to fetch teacher and students:", error);
    res.status(500).json({ error: "Failed to fetch teacher's students" });
  }
};
