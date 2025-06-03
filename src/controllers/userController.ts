import { Request, response, Response } from "express";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import prisma from "../prisma/client";
//Create User ➕

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role, classId } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      res
        .status(403)
        .json({ message: " Имэйл бүртгэгдсэн байна. Нэвтэрнэ үү." });
      return;
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      res
        .status(409)
        .json({ message: " Нэр давхцаж байна. Өөр нэр сонгоно уу." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user first
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
      },
    });

    // Depending on role, create related models
    if (role === "teacher") {
      const teacher = await prisma.teacher.create({
        data: {
          userId: newUser.id,
          email: newUser.email,
          firstName: "",
          lastName: "",
          subject: [],
          password: hashedPassword,
        },
      });

      res.status(201).json({
        success: true,
        user: newUser,
        teacher,
      });
      return;
    }



    if (role === "student") {
      const student = await prisma.student.create({
        data: {
          user: { connect: { id: newUser.id } },
          email: newUser.email,
          firstName: "",
          lastName: "",
          class: classId ? { connect: { id: classId } } : undefined,
        },
      });


      res.status(201).json({ success: true, user: newUser, student });
    }
    return;
  } catch (err) {
    console.error("❌ Error creating user:", err);
    res.status(500).json({ error: "Хэрэглэгч үүсгэхэд алдаа гарлаа." });
    return;
  }
};

// 📌 CHECK User (LOGIN)
export const checkUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findFirst({
      where: { email },
      include: {
        teacher: true,
        student: true,
      },
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

    if (user.role === "teacher") {
      res.status(200).json({
        message: "✅ Teacher authenticated successfully",
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          teacherId: user.teacher ? user.teacher.id : null,
        },
      });
    }
    if (user.role === "student") {
      res.status(200).json({
        message: "✅ Student authenticated successfully",
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          studentId: user.student ? user.student.id : null,
        },
      });
    }
  } catch (err: any) {
    console.log("❌ Login error:", err);
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
