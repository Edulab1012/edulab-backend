import express from "express";
import { addTeachingClass, deleteTeachingClass, getClassesByTeacher } from "../controllers/teachingClassController";


const router = express.Router();

router.post("/", addTeachingClass);
router.get("/:teacherId", getClassesByTeacher);
router.delete("/:id", deleteTeachingClass);

export default router;

