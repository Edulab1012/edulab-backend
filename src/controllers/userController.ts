import { Request, Response } from "express";
import prisma from "../prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: string;
  role: string;
  teacherId?: string;
  groupId?: string;
  gradeId?: string;
}
const JWT_SECRET = "my_super_secret_key_123456";
// 📌 CREATE User
export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, role },
    });

    res.status(201).json(user);
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
};

// 📌 CHECK User (LOGIN)
export const checkUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = (await prisma.user.findUnique({
      where: { email },
      include: { teacher: true },
    })) as typeof prisma.user extends {
      findUnique: (...args: any) => Promise<infer U>;
    }
      ? U & { teacher?: { id: string; groupId?: string; gradeId?: string } }
      : any;

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    // const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) {
    //   res.status(401).json({ error: "Invalid credentials" });
    //   return;
    // }

    const payload: JwtPayload = {
      id: user.id,
      role: user.role,
    };

    if (user.teacher) {
      payload.teacherId = user.teacher.id;
      payload.groupId = user.teacher.groupId;
      payload.gradeId = user.teacher.gradeId;
    }

    const token = jwt.sign(payload, JWT_SECRET!, {
      expiresIn: "1d",
    });

    res.status(200).json({
      success: true,
      message: user.role,
      token,
      userId: user.id,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};

// 📌 GET ALL Users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (err) {
    console.error("Fetch users error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};
