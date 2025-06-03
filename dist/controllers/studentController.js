"use strict";
// import { Request, Response } from "express";
// import prisma from "../prisma/client";
// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";
// dotenv.config();
// // ✅ Add Student
// export const addStudent = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader?.startsWith("Bearer")) {
//       res.status(401).json({
//         error: "❗ Token is missing. Please login and include the Authorization header like: Bearer <token>",
//       });
//       return;
//     }
//     const token = authHeader.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
//       userId: string;
//       role: string;
//       id: string; // teacherId
//     };
//     const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
//     const teacher = await prisma.teacher.findUnique({ where: { id: decoded.id } });
//     if (!teacher) {
//       res.status(400).json({
//         error: "❗ Teacher not found",
//         message: "❗ Багшийн мэдээлэл олдсонгүй.",
//       });
//       return;
//     }
//     const { firstName, lastName, email, phoneNumber, emergencyNumber, gender } = req.body;
//     if (!gender || !["male", "female"].includes(gender)) {
//       res.status(400).json({ error: "Invalid gender value" });
//       return;
//     }
//     const newStudent = await prisma.student.create({
//       data: {
//         firstName,
//         lastName,
//         email,
//         phoneNumber,
//         emergencyNumber,
//         gender,
//         teacherId: teacher.id,
//         user: {
//           create: {
//             username: email,
//             email,
//             password: "student1234",
//             role: "student",
//           },
//         },
//       },
//       include: {
//         user: true,
//       },
//     });
//     res.status(201).json({
//       message: `✅ New Student ${firstName} ${lastName} created`,
//       student: newStudent,
//     });
//   } catch (error: any) {
//     console.log("❌ Error adding student:", error);
//     if (error.name === "TokenExpiredError") {
//       res.status(401).json({ error: "⏰ Token has expired. Please login again." });
//     } else if (error.name === "JsonWebTokenError") {
//       res.status(401).json({ error: "❗ Invalid token. Please login again." });
//     } else {
//       res.status(500).json({ error: "Failed to add student" });
//     }
//   }
// };
// // ✅ Get Students by Teacher
// export const getStudentsByTeacher = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader?.startsWith("Bearer")) {
//       res.status(401).json({ error: "❗ Token is missing. Please login and include the Authorization header" });
//       return;
//     }
//     const token = authHeader.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
//       userId: string;
//       role: string;
//       id: string; // teacherId
//     };
//     const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
//     if (!user || user.role !== "teacher") {
//       res.status(403).json({ error: "⛔ You are not authorized to view these students" });
//       return;
//     }
//     const students = await prisma.student.findMany({
//       where: { teacherId: decoded.id },
//       include: {
//         teacher: true,
//       },
//     });
//     res.status(200).json(students);
//   } catch (error: any) {
//     console.log("❌ Error fetching students:", error);
//     if (error.name === "TokenExpiredError") {
//       res.status(401).json({ error: "⏰ Token has expired. Please login again." });
//     } else if (error.name === "JsonWebTokenError") {
//       res.status(401).json({ error: "❗ Invalid token. Please login again." });
//     } else {
//       res.status(500).json({ error: "Failed to fetch students" });
//     }
//   }
// };
// // ✅ Get All Students
// export const getAllStudents = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const students = await prisma.student.findMany({
//       include: {
//         teacher: true,
//       },
//     });
//     console.log("📦 All students fetched:", students.length);
//     res.status(200).json({ students });
//   } catch (error: any) {
//     console.log("❌ Failed to fetch students:", error.message);
//     res.status(500).json({ error: "Сурагчдын мэдээллийг авахад алдаа гарлаа." });
//   }
// };
//# sourceMappingURL=studentController.js.map