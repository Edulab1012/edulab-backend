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
} from "../controllers/teacherController";

const router = Router();
router
  .post("/", addTeacher)
  // .get("/withStudents", getStudentsWithAttendance)
  .post("/attendance", submitAttendance)
// .get("/attendance/today", getTodaysAttendance);

export default router;
