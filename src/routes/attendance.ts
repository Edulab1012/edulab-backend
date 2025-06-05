import { Router } from "express";
import {
  submitAttendance,
  getTodaysAttendance,
  getAttendanceSummary,
  getClassTodaysAttendance,
} from "../controllers/attendanceController";

const router = Router();

router.post("/submit", submitAttendance);
router.get("/today", getTodaysAttendance);
router.get("/summary", getAttendanceSummary);
router.get("/class/:classId/today", getClassTodaysAttendance);
export default router;
