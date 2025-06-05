import express from "express";
import cors from "cors";
import { Request, Response } from "express";
import postRoutes from "./routes/post";
import authRoutes from "./routes/auth";
import attendanceRoutes from "./routes/attendance";
// import teacherRoutes from "./routes/teacher";
import studentRoutes from "./routes/student";
import classRoutes from "./routes/class";
import { createServer } from "http";
import { createClient } from "@supabase/supabase-js";
// import semesterRoutes from "./routes/semester";
import { createClass } from "./controllers/ClassController";

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL || "your-supabase-url";
const supabaseKey = process.env.SUPABASE_KEY || "your-supabase-key";
export const supabase = createClient(supabaseUrl, supabaseKey);

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/teacher", teacherRoutes);
app.use("/api/v1/student", studentRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/class", classRoutes);
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
