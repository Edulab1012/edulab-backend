import { Request, Response } from "express";
import prisma from "../prisma/client";

export const createGroup = async (req: Request, res: Response) => {
  try {
    const { grade, group } = req.body;

    if (!grade || !group) {
      res.status(400).json({ error: "Анги болон бүлэг заавал хэрэгтэй!" });
      return;
    }

    const gradeNumber = parseInt(grade);
    let existingGrade = await prisma.grade.findUnique({
      where: { number: gradeNumber },
    });

    if (!existingGrade) {
      existingGrade = await prisma.grade.create({
        data: { number: gradeNumber },
      });
    }

    // Step 2: Check if group already
    const existingGroup = await prisma.group.findFirst({
      where: {
        name: group.toUpperCase(),
        gradeId: existingGrade.id,
      },
    });

    if (existingGroup) {
      res
        .status(409)
        .json({ error: "Ийм анги, бүлэг аль хэдийн үүссэн байна." });
      return;
    }

    // Step 3: Create Group
    const newGroup = await prisma.group.create({
      data: {
        name: group.toUpperCase(),
        gradeId: existingGrade.id,
      },
    });

    res.status(201).json({
      message: "Анги, бүлэг амжилттай үүсгэгдлээ 🎉",
      group: newGroup,
    });
    return;
  } catch (error: any) {
    console.error("Error creating group:", error);
    res.status(500).json({
      error: "Серверийн алдаа.",
      details: error.message,
    });
  }
};

export const allGroups = async (req: Request, res: Response) => {
  try {
    const groups = await prisma.group.findMany({
      include: {
        grade: true,
      },
    });

    res.status(200).json(groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ error: "Server error" });
  }
};
