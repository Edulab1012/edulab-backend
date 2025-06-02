import express from "express";
import {
  addProfile,
  addStudent,
  getAllStudents,
  getStudentsByTeacher,
} from "../controllers/studentController";


const router = express.Router();

router
  .post("/", addStudent)
  .get("/", getAllStudents)
  .get("/withStudents", getStudentsByTeacher) // 🧩 Энэ функц нь зөвхөн сурагчийн мэдээлэл төдийгүй,
// багш, бүлэг, анги зэрэг бүх холбоотой мэдээллийг хамтад нь өгдөг.
.post("/profile", addProfile)




export default router;

