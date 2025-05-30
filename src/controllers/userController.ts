import { Request, response, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client";
import bcrypt from "bcrypt";

//Create User ➕
export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: { email },
    });
    if (existingUser) {
      res.status(403).json({ error: "❌ User already exists" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
      },
    });

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to create user" });
  }
};

// 📌 CHECK User (LOGIN)
export const checkUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ error: "❌ Invalid credentials" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: "❌ Invalid credentials" });
      return;
    }

    res.status(200).json({
      message: "✅ User authenticated successfully",
    });
  } catch (err: any) {
    console.log("❌ Login error:", err);
    res.status(500).json({ message: "❌ Failed to check user", error: err });
  }
};

// // 📌 GET ALL Users
// export const getAllUsers = async (req: Request, res: Response) => {
//   try {
//     const users = await prisma.user.findMany();
//     res.status(200).json(users);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch users" });
//   }
// };
