// routes/studentRoutes.ts
import express from "express";
import { getStudent } from "../controllers/studentController";

const router = express.Router();

router.get("/:studentId", getStudent);

export default router;