import { Router } from "express";
import { checkUser, createUser, getAllUsers } from "../controllers/userController";
import { addTeacher } from "../controllers/teacherController";


const router = Router();
router.post("/", addTeacher);

export default router;