import { Request, Response } from "express";
import prisma from "../prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export async function addTeacher(req: Request, res: Response) {
  const { firstName, lastName, email, phoneNumber, subject, grade, group } =
    req.body;
  try {
    const teacher = await prisma.teacher.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        subject,
        ...(grade && { gradeRef: { connect: { id: grade } } }),
        ...(group && { groupRef: { connect: { id: group } } }),

        user: {
          create: {
            // ✅ user table руу оруулж байна
            email,
            password: "teacher1234",
            role: "teacher",
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "✅Teacher added successfully",
      data: teacher,
    });
  } catch (error: any) {
    console.log("Add teacher error:", error);
    res
      .status(500)
      .json({ error: "Failed to add teacher", err: error.message });
  }
}

export async function getStudentsWithAttendance(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    let userId: string | undefined;
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
      userId = decoded.userId;
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    const teacher = await prisma.user.findUnique({
      where: { id: userId },
      select: { teacherId: true },
    });

    if (!teacher?.teacherId) {
      res.status(404).json({ error: "Teacher not found" });
      return;
    }

    const students = await prisma.student.findMany({
      where: {
        teacherId: teacher.teacherId!,
      },
      include: {
        teacher: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        group: {
          select: {
            name: true,
          },
        },
        grade: {
          select: {
            id: true,
          },
        },
      },
    });

    res.status(200).json(students);
  } catch (error: any) {
    console.log("Error fetching students:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch students", err: error.message });
  }
}
export async function submitAttendance(req: Request, res: Response) {
  try {
    const { attendanceData } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    const userId = decoded.userId;

    const teacher = await prisma.user.findUnique({
      where: { id: userId },
      select: { teacherId: true },
    });
    console.log("teacher baina uu");
    if (!teacher?.teacherId) {
      res.status(404).json({ error: "Teacher not found" });
      return;
    }
    console.log("teacher baina", teacher.teacherId);
    const currentSemester = await prisma.semester.findFirst({
      where: { isCurrent: true },
    });

    if (!currentSemester) {
      res.status(400).json({ error: "No active semester" });
      return;
    }
    console.log("currentSemester baina", currentSemester.id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const createdAttendances = await prisma.$transaction(
      Object.entries(attendanceData).map(([studentId, status]) => {
        return prisma.attendance.upsert({
          where: {
            studentId_teacherId_date_semesterId: {
              studentId,
              teacherId: teacher.teacherId!,
              date: today,
              semesterId: currentSemester.id,
            },
          },
          update: {
            status: status as "present" | "absent" | "late",
          },
          create: {
            studentId,
            teacherId: teacher.teacherId!,
            status: status as "present" | "absent" | "late",
            date: today,
            semesterId: currentSemester.id,
          },
        });
      })
    );

    res.status(200).json({
      success: true,
      message: "Attendance submitted successfully",
      data: createdAttendances,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
export async function getTodaysAttendance(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    let userId: string | undefined;
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
      userId = decoded.userId;
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }
    const teacher = await prisma.user.findUnique({
      where: { id: userId },
      select: { teacherId: true },
    });

    if (!teacher?.teacherId) {
      res.status(404).json({ error: "Teacher not found" });
      return;
    }

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
    res
      .status(500)
      .json({ error: "Failed to fetch attendance", err: error.message });
  }
}
export async function getCurrentSemester(req: Request, res: Response) {
  try {
    const currentSemester = await prisma.semester.findFirst({
      where: { isCurrent: true },
    });
    res.status(200).json(currentSemester);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getSemesterAttendanceSummary(
  req: Request,
  res: Response
) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    const userId = decoded.userId;

    const teacher = await prisma.user.findUnique({
      where: { id: userId },
      select: { teacherId: true },
    });

    if (!teacher?.teacherId) {
      res.status(404).json({ error: "Teacher not found" });
      return;
    }

    const currentSemester = await prisma.semester.findFirst({
      where: { isCurrent: true },
    });

    if (!currentSemester) {
      res.status(404).json({ error: "No active semester found" });
      return;
    }

    const students = await prisma.student.findMany({
      where: { teacherId: teacher.teacherId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (students.length === 0) {
      res.status(404).json({ error: "No students found for this teacher" });
      return;
    }
    const attendances = await prisma.attendance.findMany({
      where: {
        teacherId: teacher.teacherId,
        semesterId: currentSemester.id,
      },
    });

    const summary = students.map((student) => {
      const studentAttendances = attendances.filter(
        (a) => a.studentId === student.id
      );
      const totalDays = studentAttendances.length;
      const presentDays = studentAttendances.filter(
        (a) => a.status === "present"
      ).length;
      const lateDays = studentAttendances.filter(
        (a) => a.status === "late"
      ).length;
      const absentDays = studentAttendances.filter(
        (a) => a.status === "absent"
      ).length;

      return {
        studentId: student.id,
        name: `${student.firstName} ${student.lastName}`,
        totalDays,
        presentDays,
        lateDays,
        absentDays,
        attendanceRate:
          totalDays > 0 ? (presentDays + lateDays * 0.5) / totalDays : 0,
      };
    });

    res.status(200).json({
      semester: currentSemester,
      summary,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
