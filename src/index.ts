import express, { Request, Response } from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import teacherRoutes from "./routes/teacher";
import groupRoutes from "./routes/group";
import teachingClassRoutes from "./routes/teachingClass";
import studentRoutes from "./routes/student";

const app = express();  // app-ийг эхэнд тодорхойлно

app.use(express.json());

// Cors зөв тохируулга
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Route-ууд
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/teacher", teacherRoutes);
app.use("/api/v1/class", groupRoutes);
app.use("/api/v1/student", studentRoutes);
app.use("/api/v1/teachingClass", teachingClassRoutes);

// Root route
app.get("/", (req: Request, res: Response) => {
  res.send("✅ Server running...");
});

// --- Хэрэв studentRoutes-д register/profile байхгүй бол нэмэх ---
// Эсвэл studentRoutes дээр энэ 2 route-г оруулна уу.

app.post("/api/v1/student/register", (req: Request, res: Response) => {
  const profile = req.body;
  console.log("📥 Шинэчлэл хүлээн авсан:", profile);
  res.json({ success: true, message: "Мэдээлэл шинэчлэгдлээ" });
});

app.post("/api/v1/student/register", (req: Request, res: Response) => {
  const profile = req.body;
  console.log("📝 Бүртгэл хийгдлээ:", profile);
  res.json({ success: true, message: "Амжилттай бүртгэгдлээ", student: profile });
});

// Сервер эхлүүлэх
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server listening at: http://localhost:${PORT}`);
});
