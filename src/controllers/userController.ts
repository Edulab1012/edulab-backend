import { Request, response, Response } from "express"
import jwt from "jsonwebtoken";
import prisma from "../prisma/client";

// 📌 CHECK User (LOGIN)
export const checkUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findFirst({
      where: { email, password },
    });

    if (!user) {
      res.status(401).json({ error: "❌ Invalid credentials" });
      return
    }

    const payload = {
      userId: user.id,
      role: user.role,
      id:
        user.role === "teacher"
          ? user.teacherId
          : user.role === "student"
            ? user.studentId
            : user.role === "parent"
              ? user.parentId
              : undefined,
    };

    if (!payload.id) {
      res.status(400).json({ error: "❌ Profile ID not linked for this user" });
      return
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "20h",
    });

    res.status(200).json({
      message: user.role,
      token,
      ...payload,
    });

  } catch (err: any) {
    console.log("❌ Login error:", err.response.data);
    res.status(500).json({ message: "❌ Failed to check user", error: err });
  }
};

// 📌 GET ALL Users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

//Create User ➕
export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body
    const user = await prisma.user.create({
      data: { email, password, role },
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to create user" });
  }
};