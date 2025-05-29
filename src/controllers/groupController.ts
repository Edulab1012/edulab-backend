import { Request, Response } from "express";
import prisma from "../prisma/client";
import jwt from "jsonwebtoken";
export const createGroup = async (req: Request, res: Response) => {
  try {
    const { grade, group } = req.body;

    if (!grade || !group) {
      res.status(400).json({ error: "Анги болон бүлэг заавал хэрэгтэй!" });
      return;
    }

    // Step 1: Check or create Grade
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
    console.log("Error creating group:", error);
    res.status(500).json({
      error: "Серверийн алдаа",
      details: error.message,
    });
  }
};

interface JwtPayload {
  userId: string;
  [key: string]: any;
}

export const allGroups = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized - No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    } catch (err) {
      res.status(401).json({ error: "Unauthorized - Invalid token" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        teacher: {
          select: { id: true },
        },
      },
    });

    if (!user?.teacher) {
      res.status(404).json({ error: "Teacher profile not found" });
      return;
    }

    const groups = await prisma.group.findMany({
      where: {
        teachers: {
          some: {
            id: user.teacher.id,
          },
        },
      },
      include: {
        grade: true,
      },
    });

    res.status(200).json(groups);
    return;
  } catch (error) {
    console.error("Error in allGroups:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: "Token expired" });
      return;
    }

    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return;
  }
};
