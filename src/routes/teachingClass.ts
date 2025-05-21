import express from "express";
import { addTeachingClass, deleteTeachingClass, getClassesByTeacher } from "../controllers/teachingClassController";


const router = express.Router();

router.post("/", addTeachingClass);
router.get("/", getClassesByTeacher);
router.delete("/", deleteTeachingClass);

export default router;

