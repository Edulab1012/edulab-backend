
import express from "express";
import { getStudent, updateStudentAvatar, updateStudentBg } from "../controllers/studentController";

const router = express.Router();

router.get("/:studentId", getStudent)
router.put("/:studentId/avatar", updateStudentAvatar);
router.put("/:studentId/bgImage", updateStudentBg);
export default router;