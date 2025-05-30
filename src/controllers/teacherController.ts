import { Request, Response } from "express";
import prisma from "../prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// ✅ Add Teacher
export async function addTeacher(req: Request, res: Response) {
  const { firstName, lastName, email, phoneNumber, subject } = req.body;
  try {
    const teacher = await prisma.teacher.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        subject,

      },
    });

    res.status(201).json({
      success: true,
      message: "✅ Teacher added successfully",
      data: teacher,
    });
  } catch (error: any) {
    console.log("Add teacher error:", error);
    res.status(500).json({ error: "Failed to add teacher", err: error.message });
  }
}

// ✅ Get Students for This Teacher
export async function getStudentsWithAttendance(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    const teacher = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { teacherId: true },
    });

    if (!teacher?.teacherId) return res.status(404).json({ error: "Teacher not found" });

    const students = await prisma.student.findMany({
      where: { teacherId: teacher.teacherId },
      include: {
        teacher: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    res.status(200).json(students);
  } catch (error: any) {
    console.log("Error fetching students:", error);
    res.status(500).json({ error: "Failed to fetch students", err: error.message });
  }
}

// ✅ Submit Attendance
export async function submitAttendance(req: Request, res: Response) {
  try {
    const { attendanceData } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ error: "Unauthorized" });
      return
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    const teacher = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { teacherId: true },
    });

    if (!teacher?.teacherId) {
      res.status(404).json({ error: "Teacher not found" });
      return
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const createdAttendances = await prisma.$transaction(
      Object.entries(attendanceData).map(([studentId, status]) =>
        prisma.attendance.upsert({
          where: {
            studentId_teacherId_date: {
              studentId,
              teacherId: teacher.teacherId!,
              date: today,
            },
          },
          update: { status: status as "present" | "absent" | "late" },
          create: {
            studentId,
            teacherId: teacher.teacherId!,
            status: status as "present" | "absent" | "late",
            date: today,
          },
        })
      )
    );

    res.status(200).json({
      success: true,
      message: "Attendance submitted successfully",
      data: createdAttendances,
    });
  } catch (error: any) {
    console.log("Error submitting attendance:", error);
    res.status(500).json({ error: "Failed to submit attendance", err: error.message });
  }
}

// ✅ Get Today's Attendance
export async function getTodaysAttendance(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    const teacher = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { teacherId: true },
    });

    if (!teacher?.teacherId) return res.status(404).json({ error: "Teacher not found" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendances = await prisma.attendance.findMany({
      where: {
        teacherId: teacher.teacherId,
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
    }, {} as Record<string, "present" | "absent" | "late">);

    res.status(200).json(attendanceMap);
  } catch (error: any) {
    console.log("Error fetching today's attendance:", error);
    res.status(500).json({ error: "Failed to fetch attendance", err: error.message });
  }
}