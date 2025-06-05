// controllers/studentController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getStudent = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ message: "Failed to fetch student" });
  }
};

//student Avatar profile image uplaod 
export const updateStudentAvatar = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      res.status(400).json({ message: "avatarUrl is required" });
      return
    }

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: { avatarUrl },
    });

    res.status(200).json({ message: "Avatar updated", student: updatedStudent });
  } catch (error) {
    console.error("Error updating student avatar:", error);
    res.status(500).json({ message: "Failed to update avatar" });
  }
};

export const updateStudentBg = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const { bgUrl } = req.body;

    if (!bgUrl) {
      res.status(400).json({ message: "bgUrl is required" });
      return
    }

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: { bgImage: bgUrl },
    });

    res.status(200).json({ message: "BG updated", student: updatedStudent });
  } catch (error) {
    console.error("Error updating student BG:", error);
    res.status(500).json({ message: "Failed to update BG" });
  }
};