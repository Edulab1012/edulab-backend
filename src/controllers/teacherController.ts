import { Request, Response } from "express";
import prisma from "../prisma/client";

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
            email,
            password: "1234",
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
    console.error("Add teacher error:", error);
    res
      .status(500)
      .json({ error: "Failed to add teacher", err: error.message });
  }
}
