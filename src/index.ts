import express from "express";
import cors from "cors";
import { Request, Response } from "express";

import authRoutes from "./routes/auth";
import teacherRoutes from "./routes/teacher";
import groupRoutes from "./routes/group";

const app = express();
app.use(cors());
app.use(express.json());

// app.use("/api/v1/student", studentRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/teacher", teacherRoutes);
app.use("/api/v1/class", groupRoutes);;

app.get("/", (req: Request, res: Response) => {
  try {
    res.send("✅ Server running...");
  } catch (error) {
    console.error("Error in root route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Server listening at: http://localhost:${PORT}`);
});
