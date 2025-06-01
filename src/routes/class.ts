import express from "express";
import {
  checkClass,
  createClass,
  getTeacherClasses,
  getClassStudents,
} from "../controllers/ClassController";

const router = express.Router();

router.post("/create", createClass);
router.post("/joinClass", checkClass);
router.get("/teacher/:teacherId", getTeacherClasses);
router.get("/:classId/students", getClassStudents);

export default router;
