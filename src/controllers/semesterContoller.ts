// import { Request, Response } from "express";
// import prisma from "../prisma/client";

// export async function createSemester(req: Request, res: Response) {
//   const { name, startDate, endDate, isCurrent } = req.body;

//   try {
//     if (isCurrent) {
//       await prisma.semester.updateMany({
//         where: { isCurrent: true },
//         data: { isCurrent: false },
//       });
//     }

//     const semester = await prisma.semester.create({
//       data: {
//         name,
//         startDate: new Date(startDate),
//         endDate: new Date(endDate),
//         isCurrent,
//       },
//     });

//     res.status(201).json(semester);
//   } catch (error: any) {
//     res.status(500).json({ error: error.message });
//   }
// }

// export async function getSemesters(req: Request, res: Response) {
//   try {
//     const semesters = await prisma.semester.findMany({
//       orderBy: { startDate: "desc" },
//     });
//     res.status(200).json(semesters);
//   } catch (error: any) {
//     res.status(500).json({ error: error.message });
//   }
// }

// export async function setCurrentSemester(req: Request, res: Response) {
//   const { id } = req.params;

//   try {
//     await prisma.semester.updateMany({
//       where: { isCurrent: true },
//       data: { isCurrent: false },
//     });

//     const semester = await prisma.semester.update({
//       where: { id },
//       data: { isCurrent: true },
//     });

//     res.status(200).json(semester);
//   } catch (error: any) {
//     res.status(500).json({ error: error.message });
//   }
// }
