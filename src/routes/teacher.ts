import { Router } from "express";
import {
  checkUser,
  createUser,
  getAllUsers,
} from "../controllers/userController";
import {
  addTeacher,
  getStudentsWithAttendance,
  submitAttendance,
  getTodaysAttendance,
  getCurrentSemester,
  getSemesterAttendanceSummary,
} from "../controllers/teacherController";

const router = Router();
router
  .post("/", addTeacher)
  .get("/withStudents", getStudentsWithAttendance)
  .post("/attendance/submit", submitAttendance)
  .get("/attendance/today", getTodaysAttendance)
  .get("/currentSemester", getCurrentSemester)
  .get("/attendance/summary", getSemesterAttendanceSummary);

export default router;
