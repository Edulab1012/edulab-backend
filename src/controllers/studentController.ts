import { Request, Response } from "express";
import prisma from "../prisma/client";

export const addStudent = async (req: Request, res: Response) => {
  const {
    teacherId,
    firstName,
    lastName,
    email,
    phoneNumber,
    emergencyNumber,
  } = req.body;

  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: "52aca953-dd89-4650-90e0-ddda6711ef9b" },
    });

    if (!teacher || !teacher.groupId) {
      res
        .status(400)
        .json({ error: "Teacher not found or not assigned to any grade" });
      return;
    }

    const existingStudent = await prisma.student.findUnique({
      where: { email },
    });

    if (existingStudent) {
      res.status(409).json({ error: "Student with this email already exists" });
      return;
    }

    const student = await prisma.student.upsert({
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
