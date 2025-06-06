import express from "express";
import cors from "cors";
import { Request, Response } from "express";
import postRoutes from "./routes/post";
import authRoutes from "./routes/auth";
import attendanceRoutes from "./routes/attendance";
import studentRoutes from "./routes/student";
import classesRoutes from "./routes/classes";

import { createClient } from "@supabase/supabase-js";
// import semesterRoutes from "./routes/semester";

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl =
  process.env.SUPABASE_URL || "https://iuuliuoqgudrqrjfdsuo.supabase.co";
const supabaseKey =
  process.env.SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1dWxpdW9xZ3VkcnFyamZkc3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzczODIsImV4cCI6MjA2MzYxMzM4Mn0.Sw85JlpgRLP8P_dXBn9Fa5rnnjHez62v85U5v1ps9KA";
export const supabase = createClient(supabaseUrl, supabaseKey);

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://edulab-frontend-kappa.vercel.app/",
      "https://edulab-frontend-git-main-edulabs-projects.vercel.app/",
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/teacher", teacherRoutes);
app.use("/api/v1/student", studentRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/class", classesRoutes);
// app.use("/api/v1/semester", semesterRoutes);
app.get("/", (req: Request, res: Response) => {
  try {
    res.send("✅ Server running...");
  } catch (error) {
    console.log("Error in root route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Server listening at: http://localhost:${PORT}`);
});
