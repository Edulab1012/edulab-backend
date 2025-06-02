import express from "express";
import {
    checkClass,
    createClass,
    getTeacherClasses,
    getClassStudents,
    deleteClass,
} from "../controllers/ClassController";

const router = express.Router();

router.post("/create", createClass);
router.post("/joinClass", checkClass);
router.get("/teacher/:teacherId", getTeacherClasses);
router.get("/:classId/students", getClassStudents);
router.delete("/:classId", deleteClass);
export default router;
