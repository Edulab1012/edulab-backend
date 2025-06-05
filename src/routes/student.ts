
import express from "express";
import { getStudent, updateStudentAvatar } from "../controllers/studentController";

const router = express.Router();

router.get("/:studentId", getStudent)
router.put("/:studentId/avatar", updateStudentAvatar);
export default router;