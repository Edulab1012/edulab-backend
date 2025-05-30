import { Request, response, Response } from "express"
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

//Create User ➕

const prisma = new PrismaClient();

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role, classId } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      res.status(403).json({ message: "❌ Хэрэглэгч аль хэдийн бүртгэгдсэн байна." });
      return;
    }
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      res.status(409).json({ message: "❗ Энэ хэрэглэгчийн нэр аль хэдийн байна." }); return
    }
    if (role === "student") {
      const existingStudent = await prisma.student.findUnique({
        where: { email },
      });

      if (existingStudent) {
        res.status(409).json({
          message: "❗ Энэ имэйлээр сурагч бүртгэгдсэн байна.",
        });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Эхлээд хэрэглэгчийг үүсгэнэ
      const newUser = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role,
        },
      });

      // Ролиос хамаарч холбоотой model-уудыг үүсгэнэ
      if (role === "teacher") {
        const teacher = await prisma.teacher.create({
          data: {
            user: { connect: { id: newUser.id } },
            email: newUser.email,
            firstName: "",
            lastName: "",
            subject: [],
          },
        });

        // User-ийг шинэчилж teacherId-г хадгална
        await prisma.user.update({
          where: { id: newUser.id },
          data: { teacherId: teacher.id },
        });
      }

      if (role === "student") {
        const student = await prisma.student.create({
          data: {
            user: { connect: { id: newUser.id } },
            email: newUser.email,
            firstName: "",
            lastName: "",
            class: classId ? { connect: { id: classId } } : undefined, // Хэрэв classId өгөгдсөн бол холбох
          },
        });

        // User-ийг шинэчилж studentId-г хадгална
        await prisma.user.update({
          where: { id: newUser.id },
          data: { studentId: student.id },
        });
      }

      // Амжилттай хариу буцаах
      res.status(201).json({ success: true, user: newUser });
      return;
    }
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
    });

    if (!user) {
      res.status(401).json({ error: "❌ Invalid credentials" });
      return
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: "❌ Invalid credentials" });
      return
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
        }
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
        }
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
