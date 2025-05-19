import express from "express";
import {
  addStudent,
  getAllStudents,

} from "../controllers/studentController";

const router = express.Router();

router
  .post("/", addStudent)
  .get("/", getAllStudents) // 🧩 Энэ функц нь зөвхөн сурагчийн мэдээлэл төдийгүй,
// багш, бүлэг, анги зэрэг бүх холбоотой мэдээллийг хамтад нь өгдөг.


export default router;
