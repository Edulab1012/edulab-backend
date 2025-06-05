import { Request, response, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client";
//Create User ➕

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, firstName, phoneNumber, password, role, classId } =
      req.body;

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
      //✅
      const token = createToken({ teacher });
      res.status(201).json({
        success: true,
        user: newUser,
        teacher: { id: teacher?.id },
        token,
      });
      return;
    }

    if (role === "student") {
      const student = await prisma.student.create({
        data: {
          user: { connect: { id: newUser.id } },
          email: newUser.email,
          firstName: firstName,
          lastName: "",
          phoneNumber: newUser.phoneNumber,
          class: classId ? { connect: { id: classId } } : undefined,
        },
      });
      //✅
      const token = createToken({ student });
      res.status(201).json({
        success: true,
        user: newUser,
        student: { id: student?.id },
        token,
      });
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
      const teacher = await prisma.teacher.findFirst({ where: { email } });
      const token = createToken({ teacher });
      res.status(200).json({
        message: "✅ Teacher authenticated successfully",
        success: true,
        user: {
          id: user.id,
          role: user.role,
        },
        teacher: { id: teacher?.id },
        token,
      });
    }
    if (user.role === "student") {
      const student = await prisma.student.findFirst({ where: { email } });
      const token = createToken({ student });
      res.status(200).json({
        message: "✅ Student authenticated successfully",
        success: true,
        user: {
          id: user.id,
          role: user.role,
        },
        student: { id: student?.id },
        token,
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

// TOKEN uusgegch function
const createToken = (payload: object) => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
};

//Google register
export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { id, email, fullName, avatarUrl, role, classId } = req.body;
    if (!role) {
      res.status(400).json({ success: false, message: "ROLE is missing" });
      return;
    }
    try {
      const existingUser = await prisma.user.findFirst({ where: { email }, include: { teacher: true, student: true } });
      const token = createToken({ existingUser });
      if (existingUser && existingUser.role == "teacher") {
        res.status(200).json({
          success: true,
          user: existingUser,
          teacher: { id: existingUser.teacher?.id },
          token,
        });
        return;
      }
      if (existingUser && existingUser.role == "student") {
        res.status(200).json({
          success: true,
          user: existingUser,
          student: { id: existingUser.student?.id },
          token,
        });
        return;
      }
    } catch (err) {
      res.status(401).json({ success: false, message: "Existing user" });
    }

    const defaultPassword = await bcrypt.hash("password", 10);
    const newUser = await prisma.user.create({
      data: {
        id,
        email,
        username: fullName ?? email,
        role,
        password: defaultPassword,
      }
    });
    // 🌱 Create role-based Teacher
    if (role === "teacher") {
      const teacher = await prisma.teacher.create({
        data: {
          userId: newUser.id,
          email,
          firstName: fullName ?? "",
          lastName: "",
          avatarUrl,
          subject: [],
          password: defaultPassword,
        },
      });
      const token = createToken({ teacher });
      res.status(201).json({
        success: true,
        user: newUser,
        teacher: { id: teacher.id },
        token,
      });
      return;
    }
    if (role === "student") {
      const student = await prisma.student.create({
        data: {
          user: { connect: { id: newUser.id } },
          email,
          firstName: fullName ?? "",
          lastName: "",
          avatarUrl,
          class: classId ? { connect: { id: classId } } : undefined,
        },
      });

      const token = createToken({ student });
      res.status(201).json({
        success: true,
        user: newUser,
        student: { id: student.id },
        token,
      });
      return;
    }

    res.status(400).json({ message: "Роль буруу байна." });
  } catch (err) {
    console.error("❌ Google Auth Error:", err);
    res.status(500).json({ error: "Google-р бүртгэхэд алдаа гарлаа." });
  }
};
