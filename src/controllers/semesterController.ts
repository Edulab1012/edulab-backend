// import { Request, Response } from "express";
// import prisma from "../prisma/client";
// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";
// dotenv.config();

// export async function createSemester(req: Request, res: Response) {
//   try {
//     const { name, startDate, endDate, totalDays, classId } = req.body;
//     const token = req.headers.authorization?.split(" ")[1];

//     if (!token) {
//       res.status(401).json({ error: "Unauthorized" });
//       return;
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
//       teacher: {
//         userId: string;
//       };
//     };

//     const teacher = await prisma.user.findUnique({
//       where: { id: decoded.teacher.userId },
//       include: { teacher: true },
//     });

//     if (!teacher?.teacher) {
//       res.status(404).json({ error: "Teacher not found" });
//       return;
//     }

//     // Deactivate all other semesters for this class
//     await prisma.semester.updateMany({
//       where: { classId, isActive: true },
//       data: { isActive: false },
//     });

//     const semester = await prisma.semester.create({
//       data: {
//         name,
//         startDate: new Date(startDate),
//         endDate: new Date(endDate),
//         totalDays,
//         classId,
//         isActive: true,
//       },
//     });

//     res.status(201).json(semester);
//   } catch (error: any) {
//     console.error("Error creating semester:", error);
//     res.status(500).json({
//       error: "Failed to create semester",
//       message: error.message,
//     });
//   }
// }

// export async function getActiveSemester(req: Request, res: Response) {
//   try {
//     const { classId } = req.params;
//     const token = req.headers.authorization?.split(" ")[1];

//     if (!token) {
//       res.status(401).json({ error: "Unauthorized" });
//       return;
//     }

//     const semester = await prisma.semester.findFirst({
//       where: {
//         classId,
//         isActive: true,
//       },
//     });

//     if (!semester) {
//       res.status(404).json({ error: "No active semester found" });
//       return;
//     }

//     res.status(200).json(semester);
//   } catch (error: any) {
//     console.error("Error fetching active semester:", error);
//     res.status(500).json({
//       error: "Failed to fetch active semester",
//       message: error.message,
//     });
//   }
// }

// export async function getClassSemesters(req: Request, res: Response) {
//   try {
//     const { classId } = req.params;
//     const token = req.headers.authorization?.split(" ")[1];

//     if (!token) {
//       res.status(401).json({ error: "Unauthorized" });
//       return;
//     }

//     const semesters = await prisma.semester.findMany({
//       where: { classId },
//       orderBy: { createdAt: "desc" },
//     });

//     res.status(200).json(semesters);
//   } catch (error: any) {
//     console.error("Error fetching class semesters:", error);
//     res.status(500).json({
//       error: "Failed to fetch class semesters",
//       message: error.message,
//     });
//   }
// }
